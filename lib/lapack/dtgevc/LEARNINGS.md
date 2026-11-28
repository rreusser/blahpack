# dtgevc: Translation Learnings

## Translation pitfalls

- **dlacpy stride order for WORK as 2D matrix**: When treating a 1D WORK array as a 2D matrix with `dlacpy`, the strides must be `(strideWORK, N * strideWORK)` (row stride, column stride), NOT `(N * strideWORK, strideWORK)`. The Fortran `CALL DLACPY(' ', N, NW, WORK(2*N+1), N, ...)` has leading dimension N, which maps to column stride = N in column-major layout.

- **dlaln2 B/X stride order**: The `dlaln2` function takes `(strideB1, strideB2)` where strideB1 is the row stride and strideB2 is the column stride. For a 2x2 column-major SUM array, strides are `(1, 2)`, NOT `(2, 1)`. Same applies to the output X matrix.

- **dgemv column count and 0-based indexing**: The Fortran `DGEMV('N', N, N+1-JE, ...)` uses 1-based JE. When converting to 0-based `je`, the column count becomes `N - je` (not `N + 1 - je`), since `N+1-JE` in 1-based = `N+1-(je+1)` = `N-je` in 0-based.

- **Complex pair placement affects coverage**: A 2x2 complex block at the bottom of the matrix means the forward-solve loop (left eigenvectors) doesn't execute because there are no rows below. To exercise the complex forward-solve code path, the complex pair must be at the top or middle of the matrix. Conversely, for right eigenvectors (backward solve), the complex pair at the bottom exercises the backward-solve path since there are rows above.

## Dependency interface surprises

- **dlag2 return convention**: Returns `{ scale1, scale2, wr1, wr2, wi }`. For dtgevc, the Fortran uses ACOEF=scale1, BCOEFR=wr1, BCOEFI=wi (negated for left eigenvectors).

- **dlaln2 return convention**: Returns `{ info, scale, xnorm }`. The solution X is written to the output array passed as a parameter.
