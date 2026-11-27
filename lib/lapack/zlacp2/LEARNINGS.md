# zlacp2: Translation Learnings

## Translation pitfalls

- A is Float64Array (real), B is Complex128Array (complex). Only B needs `reinterpret()`. A uses direct Float64 indexing with its own stride/offset (no `*2` conversion needed).
- The upper-triangle loop bound `i <= j && i < M` combines the `MIN(J, M)` from Fortran. Easy to get wrong if you forget the `&& i < M` guard for rectangular matrices where M < N.
- When building Fortran test fixtures, the EQUIVALENCE-based printing of B requires packing into a contiguous array first since the Fortran LDA may exceed M. Used the standard pack-before-print pattern.

## Dependency interface surprises

- N/A -- zlacp2 is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The scaffold generator assumes both A and B have the same type (both Float64Array in the JSDoc). For mixed real/complex routines like zlacp2, the JSDoc types in ndarray.js and base.js needed manual correction (B should be Complex128Array).

## Coverage gaps

- N/A -- achieved 100% line, branch, and function coverage. All three uplo branches (upper, lower, full) are exercised by multiple test cases including square, rectangular (M > N and M < N), 1x1, and edge cases.

## Complex number handling

- No complex arithmetic needed. The routine only copies real values into the real part of complex elements and sets imaginary parts to zero. Used `reinterpret()` on B to get Float64Array view, then wrote `Bv[idx] = A[ia]` for real part and `Bv[idx+1] = 0.0` for imaginary part.
- B strides/offsets use complex-element convention (multiplied by 2 internally for Float64 indexing). A strides/offsets are direct Float64 indices with no conversion.
