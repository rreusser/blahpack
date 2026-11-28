# LEARNINGS

## Translation pitfalls
- Complex QR uses single shifts (not double), so reflectors are 2x2 not 3x3 in zlahqr
- CABS1(z) = |Re(z)| + |Im(z)| is used everywhere for deflation tests
- Subdiagonal must be made real before QR iteration in zlahqr
- Complex Schur form is upper triangular (no 2x2 blocks), simplifying ztrexc

## Dependency interface surprises
- zlartg takes Float64Array [re,im] for f and g, returns [cs, sn_re, sn_im, r_re, r_im]
- zrot takes Float64Array [re,im] for sn parameter
- zlarfg takes Complex128Array for alpha and tau (via offset)
- All BLAS/LAPACK complex routines use complex-element strides (multiply by 2 internally)

## Missing automation
- The pattern of reinterpreting Complex128Array and computing Float64 strides/offsets is repeated in every complex routine. Could be a helper.

## Coverage gaps
- Full coverage requires Fortran test fixtures for each routine
- The multishift sweep (zlaqr5) has many code paths that are hard to exercise with small matrices

## Complex number handling
- Inlined complex multiply, add, subtract throughout for performance
- Used cmplx.divAt for complex division in zlahqr's Wilkinson shift
- Complex sqrt implemented as local helper function csqrt
