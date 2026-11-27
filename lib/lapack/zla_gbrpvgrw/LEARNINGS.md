# zla_gbrpvgrw: Translation Learnings

## Translation pitfalls

- Direct port from dla_gbrpvgrw. The only change is using `reinterpret()` for Float64Array views and CABS1 (`|re|+|im|`) instead of `abs()` for complex element norms.
- Complex-element strides/offsets must be multiplied by 2 for Float64 indexing. This is the standard pattern for z-prefix routines.

## Dependency interface surprises

- N/A. This is a leaf routine with no LAPACK/BLAS dependencies.

## Automation opportunities

- The d-to-z porting for simple "max absolute element" routines is fully mechanical: replace `abs(x)` with `cabs1(view, idx)`, add `reinterpret()`, double strides/offsets. Could be automated in `bin/transform.py`.
- The Fortran test porting is also mechanical: same structure with COMPLEX*16 arrays and `(re, im)` literal syntax.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No uncoverable paths -- the routine is simple with only one conditional branch (`umax !== 0`).

## Complex number handling

- Used CABS1 (`|re(z)| + |im(z)|`), which is safe to inline (no division or square root). Implemented as a local `cabs1(view, idx)` helper for readability.
- No use of cmplx.abs or cmplx.div needed -- CABS1 is the "1-norm" of a single complex number, not the true modulus.
