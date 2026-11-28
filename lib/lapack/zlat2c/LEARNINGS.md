# zlat2c: Translation Learnings

## Translation pitfalls

- `signature.py` collapses both matrix parameters (`A` and `SA`) to the
  same name `A`, because it only keys by Fortran array role and does not
  distinguish input/output matrices of different dtypes. Had to manually
  rename the output parameter to `SA` (with independent strides and
  offset) in every scaffold file: `base.js`, `ndarray.js`, `zlat2c.js`,
  `test.zlat2c.js`, README examples, benchmarks, and the TypeScript
  signature. Automation idea: extend `signature.py` to detect two
  `COMPLEX` / `COMPLEX*16` arrays in the same routine and assign
  distinct names (follow Fortran source variable names).
- `SLAMCH('O')` from reference source is the IEEE 754 binary32 overflow
  threshold `3.4028234663852886e+38`. Hoisted as a module-level `RMAX`
  constant. No need to require `@stdlib/lapack/base/slamch` — a literal
  is clearer and avoids the dependency.
- `Math.fround` must be applied independently to real and imaginary
  parts (Fortran `CMPLX` intrinsic converts each separately); you
  cannot combine them into a single rounding step.

## Dependency interface surprises

- Output goes into a `Complex64Array` but the reinterpret helper is
  `@stdlib/strided/base/reinterpret-complex64`, distinct from the
  `complex128` variant. Both are used side-by-side in this routine.

## Complex number handling

- Both input (`Complex128Array`) and output (`Complex64Array`) are
  reinterpreted to their respective underlying Float32/Float64 views
  for efficient interleaved indexing. Stride/offset multipliers of 2
  apply to each side independently (not a shared multiplier).
- Overflow check compares each real/imag component directly against
  `+/- RMAX`; there is no complex modulus here — Fortran only looks
  at `DBLE` and `DIMAG` separately, and we faithfully replicate that.

## Coverage gaps

- None. All lines and branches reach 100% with test cases covering
  upper/lower, N=0/N=1, overflow in both real and imaginary, and a
  row-major stride permutation.

## Scaffold tweaks applied

- The `init_routine.py` scaffold emits a benchmark that calls
  `uniform(N*N,...)` with `N = 10^i` (i up to 3) — this allocates
  1e12 elements at len=1e3. Rewrote both benchmarks to use
  `N = floor(sqrt(len))` so the matrix stays manageable and to
  allocate `Complex128Array`/`Complex64Array` instead of plain
  `Float64Array`. Automation idea: the scaffold generator should
  detect matrix routines (routines with LDA-shaped parameters) and
  size loops by the matrix order, not the total element count.
- The scaffolded `examples/index.js` calls the routine with an
  invented 11-argument signature. Replaced with an accurate
  minimal example.
- `codemod-tests.js` (invoked from `lint-fix.sh`) emptied the
  scaffolded `test/test.js` on first pass — it appeared the file
  had an older shape that the codemod did not handle. Recreated
  by hand; second pass was idempotent.
