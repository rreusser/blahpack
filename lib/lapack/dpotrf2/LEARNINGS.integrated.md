# dpotrf2: Translation Learnings

## Translation pitfalls

- [x] dpotrf2 is a recursive subroutine. JS handles recursion natively, but care is needed with the offset arithmetic when splitting submatrices. The A11 block starts at `offsetA`, the A12/A21 block starts at `offsetA + n1*sa2` (upper) or `offsetA + n1*sa1` (lower), and A22 starts at `offsetA + n1*sa1 + n1*sa2`.
- [x] The NaN check uses `A[offsetA] !== A[offsetA]` (idiomatic JS NaN test), mirroring the Fortran DISNAN call.
- [x] The info return from recursive calls to A22 must be offset by n1: `return iinfo + n1` to produce the correct 1-based column index of the failure.

## Dependency interface surprises

- [x] The upper case calls dtrsm with side='L', trans='T' to solve U11^T * X = A12, then dsyrk with trans='T'. The lower case calls dtrsm with side='R', trans='T' to solve X * L11^T = A21, then dsyrk with trans='N'. The side/trans combinations are mirror images.

## Automation opportunities

- [x] N/A. The recursive structure is unique to dpotrf2 and does not repeat across routines.

## Coverage gaps

- [x] Lines 84-85 (upper path error return from A22 recursion) are the only uncovered lines. Triggering this requires a matrix that is positive definite in the first n1 columns but fails in the A22 block specifically during the upper factorization. 98.21% line, 94.12% branch coverage achieved.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zpotrf2) would use conjugate transpose.
