# LEARNINGS: dtpmv

## Translation pitfalls
- Packed storage pointer `kk` advances by column size: for upper, column j has j+1 elements so `kk += (j+1)*strideAP`; for lower, column j has N-j elements so `kk += (N-j)*strideAP`.
- Lower no-transpose starts `kk` at the end of packed storage and works backward. The diagonal element position is `kk - (N-1-j)*strideAP`, not `kk`.
- Upper transpose starts `kk` at the end and decrements. The diagonal position is simply `kk` (last element of the column's packed segment).

## Dependency interface surprises
- N/A (no external dependencies)

## Missing automation
- N/A

## Coverage gaps
- 100% line, branch, and function coverage achieved with 7 test cases covering all 4 uplo x trans branches, unit diagonal, N=0 edge case, and stride=2.

## Complex number handling
- N/A (real-valued routine)
