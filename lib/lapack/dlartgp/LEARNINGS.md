# dlartgp: Translation Learnings

## Translation pitfalls

- The Fortran signature `DLARTGP(F, G, CS, SN, R)` has three scalar
  output arguments. JavaScript cannot return values via scalar
  parameters, so the JS module follows the existing `dlartg`
  precedent: the low-level `base.js` / `ndarray.js` takes `(f, g, out)`
  where `out` is a `Float64Array` of length 3 written as
  `out[0]=cs`, `out[1]=sn`, `out[2]=r`; the main export wraps this
  and returns `{ c, s, r }`.

- The Fortran source contains a defensive `IF( R.LT.ZERO )` branch
  that sign-flips `cs`, `sn`, and `r`. Since `r` is computed as a
  `SQRT(...)`, it is always non-negative in IEEE arithmetic, so this
  branch is unreachable. The JS translation preserves it (for faithful
  semantics and parity with the reference), and its four lines appear
  as uncovered in the coverage report.

- `dlartgp` uses the *older* iterative rescaling style from the
  original `dlartg` (SAFMN2/SAFMX2 computed from `DLAMCH('S')`,
  `DLAMCH('E')`, `DLAMCH('B')`) rather than the newer RTMIN/RTMAX
  single-shot rescaling used by `lib/lapack/base/dlartg/lib/base.js`.
  Keep the iterative `do-while` loops with the count bookkeeping to
  match reference behaviour bit-for-bit; do not naively reuse the
  `dlartg` JS implementation.

- Non-negativity of `r` applies to `r` only. When `f` is negative and
  `g != 0`, the resulting `cs` is negative (because it is `f1/r` with
  `r > 0`). The relation is: `r = sqrt(f^2 + g^2) >= 0`, `cs = f/r`,
  `sn = g/r` (after any rescaling, with factors applied only to `r`).

## Dependency interface surprises

- `dlartgp` depends on `dlamch` in the Fortran reference, but we
  precompute the constants at module load time so there is no runtime
  call to `dlamch`. The deps file still lists `dlamch` for the
  Fortran link step.

## Benchmark scaffold

- The `init_routine.py` scaffold emits a stride-style benchmark with
  `createBenchmark(len)` closures and calls `dlartgp( N, N, N, N, N )`.
  This is inappropriate for a scalar routine: replace with a single
  `bench( pkg, benchmark )` invocation and a module-scope `benchmark`
  function (`stdlib/no-unnecessary-nested-functions` forbids the
  closure pattern, and `no-restricted-syntax` forbids inline
  `FunctionExpression` for `bench()` callbacks).

## Lint notes

- `stdlib/signature-conformance` emits a *warning* because the JS
  signature `(f, g, out)` differs from the Fortran `(F, G, CS, SN, R)`.
  This is an intentional, unavoidable deviation (same as `dlartg`).
- `stdlib/jsdoc-list-item-spacing` requires a blank line between
  multi-line `-` bullets inside `## Notes` sections in JSDoc.
