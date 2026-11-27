# dsptri: Translation Learnings

## Translation pitfalls

- IPIV convention: dsptrf stores 0-based indices with bitwise NOT (~p) for 2x2 pivots. In dsptri, must decode via `kp < 0 ? ~kp : kp` then add 1 for 1-based internal indexing.
- Packed indexing: KC and KCNEXT are 1-based positions in the packed array, requiring `(pos-1)*strideAP` when accessing AP.
- The singularity check loop reuses `info` as the loop variable before resetting it to 0.
- Lower branch: `kcnext = kc - (N - k + 2)` and the 2x2 block case further adjusts `kcnext -= (N - k + 3)`.
- The 2x2 pivot swap in the upper case accesses `AP[kc+k+k-2]` and `AP[kc+k+kp-2]` (Fortran line `AP(KC+K+K-1)` mapped to 0-based).

## Dependency interface surprises

- dspmv requires 13 parameters (uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY) -- more than most BLAS routines.
- dcopy and ddot take 7 params each (N, x, strideX, offsetX, y, strideY, offsetY).

## Automation opportunities

- The signature conformance linter warns about 11 params vs expected 8, but this is correct since WORK needs stride+offset. Could add WORK as a known extra-array pattern.

## Coverage gaps

- The swap loop between kp and k in upper branch (lines 174-179) only executes when there are elements strictly between kp and k, which requires kp < k-1. This path is exercised by the indefinite test matrices.
- Singular matrix early return paths (lines 94-96, 102-104) are not exercised since all test matrices are non-singular after factorization.

## Complex number handling

- N/A: dsptri is a real-valued routine.
