# ARPACK translation plan (symmetric shift-invert path)

Scope: translate the double-precision **symmetric** ARPACK drivers into
`lib/arpack/base/`, faithful to arpack-ng 3.9.1 (vendored at
`data/arpack-ng-3.9.1/`, BSD-3-Clause / Rice — see `LICENSE.txt`). Motivating
consumer: the Möbius notebook's flexural-modes step (Fix A), which wants the
lowest eigenpairs of a banded symmetric generalized pencil via shift-invert
instead of `dsbgvx`'s full band→tridiagonal reduction. This follows
[optimization-policy.md](optimization-policy.md): ARPACK is a *different
reference package* realizing a *different algorithm*, so it gets its own
provenance slot and faithful translation — not grafted into a LAPACK routine.

## Closure is self-contained

Every numeric leaf the `dsband`/`dsaupd`/`dseupd` closure calls **already
exists in blahpack** (21 routines, verified 2026-07). Only `xerbla` is
missing, and it is the LAPACK error handler — translate as a `throw`.

### Routines to translate (14, all vendored under `data/arpack-ng-3.9.1/SRC/`)

Reverse-communication driver and its dependency subtree:

| routine  | role |
|----------|------|
| `dsaupd` | top-level reverse-communication IRLM driver (entry point) |
| `dsaup2` | IRLM implementation (restart loop) |
| `dsaitr` | Arnoldi/Lanczos factorization step |
| `dsapps` | apply shifts (bulge-chase on the tridiagonal) |
| `dsconv` | convergence test |
| `dseigt` | eigenvalues of the current tridiagonal (`H`) |
| `dsgets` | select shifts |
| `dsortr` | sort Ritz values |
| `dstqrb` | tridiagonal QR (variant returning last row of Q) |
| `dgetv0` | generate/restart the starting vector |
| `dseupd` | eigenvector extraction / back-transform (post-process) |
| `dsesrt` | sort Ritz values + vectors (used by `dseupd`) |
| `dstats` | init the timing/stat state (see stubs) |
| `dsband` | banded shift-invert driver (`EXAMPLES/BAND/dsband.f`) |

### Reuse (already in `lib/`, do not re-translate)

BLAS: `daxpy dcopy dscal dswap dger dgemv dgbmv` — LAPACK:
`dgeqr2 dorm2r dlacpy dlae2 dlaev2 dlarnv dlartg dlascl dlaset dlasr dlasrt
dsteqr dgbtrf dgbtrs`.

Note `dgbtrf`/`dgbtrs` are the routines whose blocked off-by-one was fixed in
PR #9 — directly on this path, since `dsband` factors `K − σM` with them.

### Stubs / strip (debug, timing, I/O — no numerics)

`arscnd` (timer → no-op), `dvout`/`ivout`/`dmout` (debug vector/matrix print →
no-op), and the `debug.h` / `stat.h` COMMON blocks (→ a module-level state
object, or strip). `dstats` initializes the stat COMMON; keep it as a no-op
that clears the state object so call sites stay faithful. Decide once,
consistently, and document in each module's `DIFFERENCES.md`.

## The one genuinely new pattern: reverse communication

`dsaupd` returns to the caller for every operator apply (`OP·x`, `B·x`) and its
state lives in Fortran `SAVE` variables across calls:

```
save  bounds, ierr, ih, iq, ishift, iupd, iw,
      ldh, ldq, msglvl, mxiter, mode, nb, nev0, next, np, ritz
```

These are workspace indices and loop counters that must survive between
reverse-communication round-trips. JavaScript has no `SAVE`, so the pattern is
an **explicit state object** the caller threads through:

- The caller allocates `const state = {}` once and passes it to every
  `dsaupd`/`dsaup2` call; the routine reads/writes its `SAVE` fields as
  `state.np`, `state.ritz`, etc. (`dsaup2` has its own `SAVE` set — give it its
  own namespaced fields or a nested object).
- `IDO` and `info` are in/out scalars → length-1 `Int32Array` per the stdlib
  base convention (arrays for in/out scalars). The reverse-communication
  protocol is unchanged: `IDO` 0 (first call) → ±1 (`Y = OP·X`) / 2 (`Y = B·X`)
  / 3 (provide shifts) / 99 (done).
- `iparam`/`ipntr` stay `Int32Array`; `resid`/`v`/`workd`/`workl` stay
  `Float64Array` with `(stride, offset)` per convention.

Driver loop shape the notebook (or `dsband`) implements:

```js
const state = {};
const IDO = new Int32Array([0]);
do {
  dsaupd(state, IDO, 'G', n, which, nev, tol, resid, ..., info);
  if (IDO[0] === -1 || IDO[0] === 1) applyOP(workd, ipntr);   // (K−σM)⁻¹ M x via dgbtrs
  else if (IDO[0] === 2) applyB(workd, ipntr);                // M x
} while (IDO[0] !== 99);
dseupd(state, ...);                                            // extract eigenpairs
```

This state-object pattern is blahpack's first reverse-communication routine;
design it once here — ARPACK's nonsymmetric drivers (`dnaupd`) and the complex
ones reuse it.

## Verification (faithful-translation trust model)

- Side-by-side Fortran/JS on identical inputs, observing state across
  reverse-communication round-trips (arpack-ng's `TESTS/` and the
  `dsdrv*`/`dsbdr*` example drivers give reference cases with known outputs).
- Element-wise fixture comparison of returned Ritz values/vectors, plus
  `‖A x − λ M x‖` residual and M-orthonormality as secondary property checks.
- Cross-check the notebook end-to-end against `dsbgvx`: eigenvalues to rel.
  1e-10, subspace angles for degenerate clusters, at 32×6 / 64×10 / 96×16.

## Tooling note

`bin/scaffold.py` reads the reference Fortran from
`data/lapack-3.12.0/SRC/{routine}.f` (hard-coded, ~line 1721). ARPACK sources
live under `data/arpack-ng-3.9.1/SRC/` (and `EXAMPLES/BAND/`), so scaffolding
these needs either a `--source-dir` override or a small path branch keyed on
package. `routines.json` / `descriptions.json` also don't cover ARPACK; the
per-routine metadata will come from the Fortran headers directly.

## Translation order (leaves first)

1. `xerbla` (throw) + the no-op stubs (`arscnd`, `dvout`, `ivout`, `dmout`).
2. `dsconv`, `dsortr`, `dsesrt`, `dstqrb`, `dseigt`, `dsgets` — pure numeric
   leaves of the RC subtree, individually fixture-testable.
3. `dgetv0`, `dsaitr`, `dsapps` — the Lanczos-step routines.
4. `dsaup2`, then `dsaupd` — the RC driver (state-object pattern lands here).
5. `dseupd` — eigenvector extraction.
6. `dsband` — the banded shift-invert driver; wire into the notebook.
