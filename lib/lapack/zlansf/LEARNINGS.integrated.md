# LEARNINGS: zlansf

## No Fortran reference

LAPACK does not include a complex `zlansf` routine. Only real variants (`dlansf`, `slansf`) exist. This module was created by adapting `dlansf.f` to complex arithmetic.

## Complex adaptation from dlansf

- **Max norm / one-norm**: Replace `ABS(A(i))` (real) with `sqrt(re^2 + im^2)` (complex modulus). Array indexing via `reinterpret` gives interleaved Float64 pairs.
- **Frobenius norm**: Replace `DLASSQ` with `zlassq`. The `zlassq` interface uses complex-element strides and offsets. The offset computation `A(start)` in Fortran maps to `offsetA + (start * strideA)` in JS.
- **WORK array**: Stays real (`Float64Array`) since it stores sums of absolute values, not complex entries.

## RFP indexing

The RFP format packs an N-by-N symmetric matrix into an N*(N+1)/2 rectangle. The layout has 8 code paths: 2 (odd/even N) x 2 (normal/transposed) x 2 (upper/lower). Each RFP element `(i, j)` maps to a Float64 index via `oA + 2 * ((i + j * lda) * sa)`.

To avoid `no-mixed-operators` lint errors, extracted helper functions `fp(i,j)`, `wi(i)`, and `cab(i,j)` for index computation and element access.

## Test approach

Since no Fortran reference exists to generate fixtures, tests use a `packRFP` utility that converts a full column-major symmetric matrix into all 8 RFP variants. Expected norms are computed from the full matrix directly (max norm, column-sum one-norm, Frobenius). Tests cover N=3,4,5,6 (mix of odd/even) x all 4 norm types x all 8 RFP paths = 66 test cases.
