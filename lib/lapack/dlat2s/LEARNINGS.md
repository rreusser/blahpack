# dlat2s: Translation Learnings

## Translation pitfalls

- `SLAMCH('O')` returns the single-precision overflow threshold. Rather than implementing `slamch`, we use `@stdlib/constants/float32/max` directly, since that constant equals `SLAMCH('O')` for IEEE 754 binary32.
- The Fortran reference uses an early `GO TO 50` exit on overflow. We translate this to an early `return 1`. Because the loop structure is trivially nested (two `DO` loops with a single exit), the GOTO pattern collapses to a simple `return`.
- The signature scaffolder (`bin/signature.py`) produces duplicated parameters (`A, strideA1, strideA2, offsetA` twice) for routines that take two distinct arrays of different types. The scaffolded `base.js`, `ndarray.js`, `dlat2s.js`, `benchmark*.js` and README all had to be fixed by hand to distinguish the input `A` / output `SA` arguments.
- Single precision rounding is simulated with `Math.fround`. Writing the rounded value to a `Float32Array` slot already truncates to single precision, so the explicit `Math.fround` is redundant for `Float32Array` targets — however, it keeps the intent obvious and matches the Fortran `REAL( A )` cast.

## Dependency interface surprises

- `@stdlib/blas/base/assert/is-matrix-triangle` accepts `'upper'` and `'lower'` only — `'all'` returns `false`. That matches `dlat2s`'s supported values, so the gate check `signature-conformance` expects this validator even though the routine does not accept `'all'`.

## Tooling / test harness

- The stdlib eslint plugin runs test files inside a VM realm (via `evalmachine.<anonymous>`). In that realm, the built-in `TypeError` / `RangeError` constructors are *different* from the ones the routine throws, so `assert.throws( fn, TypeError )` fails with "validation function is expected to return true". Use predicate form: `assert.throws( fn, { 'name': 'TypeError' } )`.
- Scaffolded `benchmark.js` / `benchmark.ndarray.js` had duplicate `var A = uniform(...)` declarations and passed the same array for both input and output. These were rewritten to allocate a Float32Array output.
