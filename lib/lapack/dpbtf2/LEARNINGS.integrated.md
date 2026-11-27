# dpbtf2: Translation Learnings

## Translation pitfalls

- KLD = MAX(1, LDAB-1) maps to `Math.max(1, sa2 - sa1)` in the general stride case. This is the flat stride for stepping diagonally along the band (one row up/down, one column right).
- The `dsyr` call uses KLD as the LDA for the submatrix view of band storage. This means dsyr's strideA2 = KLD (not sa2), while strideA1 = sa1. Getting this wrong produces correct results for KD=1 (tridiagonal) but incorrect for KD>=2.
- Band storage format: for upper, diagonal is at row KD (0-based), and superdiagonals are at rows KD-1, KD-2, etc. For lower, diagonal is at row 0, subdiagonals at rows 1, 2, etc.

## Dependency interface surprises

- dsyr(uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA) -- strideA1 and strideA2 are independent. When operating on band storage with dsyr, strideA2 must be set to KLD (LDAB-1), not the actual column stride of the band array. This is because dsyr treats the band submatrix as a regular symmetric matrix with a different leading dimension.

## Automation opportunities

- N/A -- straightforward translation.

## Coverage gaps

- 100% line and branch coverage achieved.

## Complex number handling

- N/A -- real routine only.
