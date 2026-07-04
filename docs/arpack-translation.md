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
exists in blahpack** (21 routines, verified 2026-07). Nothing else numeric is
needed. `xerbla` is *not* on the path: the only reference to it is the
argument-check block in `dstqrb`, which ARPACK ships commented out (`c$$$`),
and blahpack does not translate `xerbla` anyway — routines that validate
arguments return the negative info code directly (e.g. `dsteqr` does
`return -1`), dropping the Fortran `XERBLA` print/stop as legacy error
reporting with no idiomatic-JS equivalent.

### Routines to translate (13, all vendored under `data/arpack-ng-3.9.1/SRC/`)

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
| `dsband` | banded shift-invert driver (`EXAMPLES/BAND/dsband.f`) |

### Reuse (already in `lib/`, do not re-translate)

BLAS: `daxpy dcopy dscal dswap dger dgemv dgbmv` — LAPACK:
`dgeqr2 dorm2r dlacpy dlae2 dlaev2 dlarnv dlartg dlascl dlaset dlasr dlasrt
dsteqr dgbtrf dgbtrs`.

Note `dgbtrf`/`dgbtrs` are the routines whose blocked off-by-one was fixed in
PR #9 — directly on this path, since `dsband` factors `K − σM` with them.

### Strip (debug, timing, stat plumbing — no numerics)

Consistent with dropping `xerbla`, strip the legacy debug/timing/stat plumbing
rather than translate it: the `dvout`/`ivout`/`dmout` calls are all gated on
`if (msglvl > k)` (debug printing), `arscnd` is a timer, `dstats` only zeroes
timing/counter COMMON (`nopx`, `tsaupd`, …), and `debug.h`/`stat.h` are those
COMMON blocks. None affect the numerical result. Omit the calls and drop
`dstats`; no stub routines are created. Record the omission in each module's
`DIFFERENCES.md`. (If a future ARPACK consumer wants iteration counts, expose
them on the reverse-communication state object rather than reviving the COMMON
plumbing.)

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

### Reverse communication vs. a matvec callback

ARPACK defers the operator apply (`OP·x`, `B·x`) so it never needs to know how
the matrix is stored — but the mechanism is **reverse communication, not a
passed-in function**. `dsaupd` takes no matvec argument; it returns to the
caller with `IDO` set and asks it to fill a slice of `workd`. The faithful
translation must keep this: turning `dsaupd`'s own signature into a
callback-taking API would be changing the routine, not translating it (per
[optimization-policy.md](optimization-policy.md)).

The callback intuition is right one layer up. Two idiomatic options sit on top
of the faithful `dsaupd`, and they are *composition*, not a change to the
reference:

- **`dsband` (preferred for Fix A).** ARPACK's own banded driver already
  encapsulates the loop: it factors `K − σM` once with `dgbtrf`, runs the
  `IDO` loop, and applies the operator **inline** with `dgbmv` (banded matvec)
  and `dgbtrs` (banded solve) — all already in `lib/`. No callback surface at
  all; the notebook just calls `dsband(...)` and gets eigenpairs. This is the
  reference-backed route (verifiable against arpack-ng's `dsbdr*` examples), so
  it is what the plan targets.
- **A generic callback driver** (`dsaupdDriver(applyOP, applyB, …)`) that runs
  the `IDO` loop and dispatches to caller-supplied closures. Legitimate and
  idiomatic, but it is *authored* glue, not a reference translation, so it
  belongs at the application layer (or a clearly-labeled non-reference helper),
  never inside `lib/arpack`. Fix A does not need it, since `dsband` covers the
  banded case.

So: reverse communication at the faithful bottom (`dsaupd`), and the operator
lives either inline in the faithful `dsband` or, if a consumer ever wants the
generic form, in an app-layer closure — matching "algorithm/operator selection
is a driver concern."

### Layering strategy: reverse communication never escapes the base

Three tiers, each with a clear faithfulness status. The invariant: **a library
user never sees `IDO`.**

1. **Faithful RC base** — `dsaupd`, `dsaup2`, `dseupd`, and the subtree
   (`dsaitr`, `dsapps`, …). Translated verbatim: state object, `IDO`/`info` as
   length-1 arrays, `workd`/`workl`/`ipntr` exactly as Fortran. These carry the
   trust and are tested number-for-number against arpack-ng by driving the same
   `IDO` loop in both and comparing `workd`/`resid`/state at **every**
   round-trip (the fixture is the sequence of `(IDO, workd-in → workd-out)`
   steps, not a single output). Reverse communication is *preserved* here, not
   hidden — it is the routine's real interface.
2. **Faithful reference driver** — `dsband`. ARPACK's own banded driver, so
   translating it faithfully gives a reference-backed encapsulation: it factors
   `K − σM` once, runs the `IDO` loop internally, applies the operator inline
   with `dgbmv`/`dgbtrs`, and returns eigenpairs — no `IDO` in its signature.
   Verified end-to-end against arpack-ng's `dsbdr1`–`dsbdr6` example outputs.
   This is the preferred encapsulation whenever a reference driver fits the
   problem shape (banded → `dsband`): the legacy loop is hidden *and* the
   hiding is itself checked against Fortran.
3. **Idiomatic wrapper (authored, no numerics)** — a thin layer that gives the
   consumer a clean call: marshal banded arrays, default `ncv`/`iparam`, return
   plain arrays of eigenvalues/vectors. Lives in the module's wrapper files or
   notebook-side. Contains no algorithm — only argument plumbing over tier 2
   (or, if the generic callback form is ever wanted, over tier 1) — so it is
   validated by the tiers beneath plus a couple of integration checks.

Recommended path for Fix A: tiers 1 + 2 faithfully (maximal verification,
including the driver plumbing), then a thin tier-3 wrapper for the notebook. Do
**not** hand-roll the RC loop as authored glue when a reference driver
(`dsband`) already encapsulates it — that would trade a Fortran-verifiable
driver for one checkable only by property tests, against the trust model.

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

1. The no-op stubs (`arscnd`, `dvout`, `ivout`, `dmout`). (No `xerbla`: it is
   not called on the path and blahpack does not translate it — see above.)
2. `dsconv`, `dsortr`, `dsesrt`, `dstqrb`, `dseigt`, `dsgets` — pure numeric
   leaves of the RC subtree, individually fixture-testable.
3. `dgetv0`, `dsaitr`, `dsapps` — the Lanczos-step routines.
4. `dsaup2`, then `dsaupd` — the RC driver (state-object pattern lands here).
5. `dseupd` — eigenvector extraction.
6. `dsband` — the banded shift-invert driver; wire into the notebook.
