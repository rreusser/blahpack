# dlatrd: Translation Learnings

## Translation pitfalls

- The UPLO='U' branch iterates backward (Fortran: `DO I = N, N-NB+1, -1`), with `IW = I - N + NB` as a secondary index into W. In 0-based JS, the loop is `for (i = N-1; i >= N-nb; i--)` with `iw = i - N + nb`. The mapping is clean once you commit to 0-based throughout.
- dlarfg takes alpha as array+offset (not scalar). For the upper branch, alpha is `A[i-1, i]` and the vector starts at `A[0, i]`. For the lower branch, alpha is `A[i+1, i]` and the vector starts at `A[min(i+2, N-1), i]`.
- The `if (i < N-1)` guard in the upper branch controls the 4-dgemv rank-update block. In 0-based code this naturally becomes `if (i < N - 1)`.

## Dependency interface surprises

- dsymv uses the standard base.js signature: `dsymv(uplo, N, alpha, A, sa1, sa2, oA, x, sx, ox, beta, y, sy, oy)`. No issues.
- dgemv uses the 2D matrix signature with strides: `dgemv(trans, M, N, alpha, A, sa1, sa2, oA, x, sx, ox, beta, y, sy, oy)`. When the vector argument is a row of a matrix (e.g., `W(I, IW+1)` with stride LDW), pass strideW2 as the vector stride.

## Automation opportunities

- N/A. The translation was straightforward from Fortran reference using the dlabrd pattern. No mechanical steps worth automating beyond what already exists.

## Coverage gaps

- 100% line and branch coverage achieved. Both UPLO='U' and 'L' are tested with NB>1 (exercising the `i < N-1` / `i > 0` inner blocks). NB=0 and N=0/1 edge cases also covered.

## Complex number handling

- N/A. dlatrd is a real-valued routine. The complex analog would be zlatrd.
