# dsytrs: Translation Learnings

## Translation pitfalls

- **IPIV decoding for 2x2 pivots**: Negative IPIV values are decoded via `~IPIV[k]` to get the 0-based pivot row. This matches the encoding used by dsytf2/dsytrf.
- **dger vs dgemv usage**: The forward elimination uses dger (rank-1 update) to subtract the contribution of each pivot row/column from the remaining RHS. The back-substitution uses dgemv (matrix-vector multiply) to accumulate the contribution of already-solved rows.
- **Row operations on B**: B is column-major with `sb1=1, sb2=LDB`. A row of B (for dswap, dscal) uses stride sb2. A column of B uses stride sb1. The Fortran `B(K,1)` with stride LDB maps to `B, sb2, offsetB + k*sb1`.
- **2x2 solve**: The 2x2 diagonal block solve computes `D^{-1} * [b_k, b_{k+1}]` by solving the 2x2 system `[akm1 1; 1 ak] * [x_k; x_{k+1}] = [bkm1; bk]` where akm1k is the off-diagonal element used to normalize.

## Dependency interface surprises

- dger(M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA): x is the column vector, y is the row vector. The rank-1 update is `A += alpha * x * y^T`.
- dgemv('T', M, N, ...): Transpose mode. First M elements of the input vector are used, N elements of the output are updated. This was used for the back-substitution `B(k,:) -= A(:,k)^T * B(:,:)`.

## Automation opportunities

- N/A.

## Coverage gaps

- Lines 76-77, 144-145, 181-182, 246-247 are uncovered: these are the "if kp !== k" swap conditions when a 2x2 pivot has kp equal to the current row. This happens when no interchange was needed for the 2x2 pivot block.
- 97.12% line coverage, 88.24% branch coverage -- meets targets.

## Complex number handling

- N/A: dsytrs is a real-valued routine.
