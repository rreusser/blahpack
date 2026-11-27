# dpbrfs: Translation Learnings

## Translation pitfalls

- Band matrix indexing requires careful mapping from Fortran 1-based to JS 0-based. In the upper case, the offset variable L maps from `KD + 1 - K` (Fortran) to `kd - k` (JS 0-based). In the lower case, L maps from `1 - K` (Fortran) to `-k` (JS 0-based).
- The NZ formula uses `min(N+1, 2*KD+2)` unlike dporfs/dpprfs which use `N+1`, reflecting the band structure's bounded nonzeros per row.

## Dependency interface surprises

- dsbmv takes `(uplo, N, K, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY)` with the band matrix having 2D strides but vectors having 1D strides.
- dpbtrs takes `strideB2` as the second-dimension stride for B (used as the leading dimension for the right-hand side when called with nrhs=1 for the workspace).

## Automation opportunities

- The residual computation pattern (abs(A)*abs(X) + abs(B)) is shared across dporfs, dpprfs, dpbrfs, differing only in the matrix storage format. Could be factored into a common helper.

## Coverage gaps

- FERR/BERR values are tested with generous tolerance (0.5 relative) since the exact values depend on the dlacn2 norm estimation which can vary by implementation. The solution vector X is tested to 1e-14.

## Complex number handling

- N/A: dpbrfs is a real-valued routine.
