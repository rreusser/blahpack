# zlantp: Translation Learnings

## Translation pitfalls

- Packed storage indexing for complex arrays: the packed index `k` advances through the 1D array in complex-element strides, but `reinterpret` gives a Float64 view where stride becomes `strideAP * 2` and offset becomes `offsetAP * 2`. The max/one/inf norm branches work on the Float64 view, while the Frobenius branch passes Complex128Array offsets directly to zlassq.
- For unit diagonal triangular matrices, the diagonal element must be skipped in the packed array (not just "ignored"), since it still occupies storage. The `k` pointer must advance past it.
- The Fortran code uses `ABS(AP(I))` which for COMPLEX*16 computes the complex modulus. In JS, this maps to `cmplx.absAt(Av, k)` on the Float64 view.

## Dependency interface surprises

- zlassq expects `(N, x, stride, offset, scale, sumsq)` where stride and offset are in complex elements, consistent with Complex128Array conventions. This differs from the Float64-stride approach in dlassq.
- The auto-generated deps file was missing `la_constants` and `la_xisnan` (Fortran module files) which are transitive dependencies of zlassq.f90. These are needed for Fortran compilation but not JS dependencies.

## Automation opportunities

- zlantp is structurally identical to dlantp but with complex modulus instead of `Math.abs()` and `zlassq` instead of `dlassq`. A mechanical transform could generate one from the other.

## Coverage gaps

- All four norms tested with upper and lower storage, unit and non-unit diagonal, for 3x3 and 4x4 matrices.
- N=0 quick return and N=1 tested for both unit and non-unit.
- Scaling edge cases (very large/small values) not tested directly but covered by zlassq's own test suite.

## Complex number handling

- All off-diagonal and diagonal elements use `cmplx.absAt(Av, k)` which computes overflow-safe complex modulus `sqrt(re^2 + im^2)`.
- No complex arithmetic (multiply, divide) needed; only complex modulus and summation.
- The Frobenius branch delegates to `zlassq` which handles Blue's scaling internally.
