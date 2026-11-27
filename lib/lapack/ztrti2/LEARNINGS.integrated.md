# ztrti2: Translation Learnings

## Translation pitfalls

- Complex diagonal inversion requires `cmplx.divAt()` with a scratch buffer to compute `1/A[j,j]`. The scratch buffer stores `(1,0)` as the numerator at indices [0..1] and the diagonal element at [2..3]. The result overwrites the diagonal position directly in the Float64Array view.
- The sign of ajj: after inverting the diagonal, the Fortran sets `AJJ = -A(J,J)`. Both real and imaginary parts must be negated. This is then passed to zscal as a `Complex128` object.
- For the lower triangular case, the submatrix offset for ztrmv is `offsetA + (j+1)*sa1 + (j+1)*sa2` (the (j+1,j+1) diagonal block), and the column vector starts at `offsetA + (j+1)*sa1 + j*sa2`.

## Dependency interface surprises

- zscal takes a `Complex128` object for the scalar (not separate real/imag parts), so `new Complex128(ajjR, ajjI)` is needed in each iteration. This is outside the hot loop so allocation is acceptable.
- ztrmv takes `Complex128Array` for both the matrix A and the vector x, with strides/offsets in complex elements. The same array can be passed for both A and x (in-place operation on column of A).

## Missing automation

- The pattern of translating real LAPACK routines to complex is highly mechanical: replace dtrmv with ztrmv, dscal with zscal, Float64Array with Complex128Array, real scalar `ajj` with complex pair `(ajjR, ajjI)`, and add `cmplx.divAt` for diagonal inversion. This could be a semi-automated transform.

## Coverage gaps

- 100% line and branch coverage achieved with 8 tests: upper/lower x non-unit/unit diagonal for 3x3, upper/lower non-unit 4x4, N=0, and N=1.

## Complex number handling

- Used `cmplx.divAt()` for diagonal inversion (never inlined complex division).
- Module-level scratch Float64Array(6) for the 1/z computation pattern.
- Complex multiply/negate inlined directly for ajj (safe per guidelines).
