# zpftrf: Translation Learnings

## Translation pitfalls

- The Fortran code uses a 0-indexed 1D array `A(0:*)` which maps directly to Complex128Array with offset. The key insight is translating the implicit 2D access pattern: when Fortran calls `ZPOTRF('L', N1, A(0), N, INFO)`, the LDA=N means the 1D array is viewed as a column-major matrix. In the ndarray convention, this becomes strideA1=sa (row stride), strideA2=sa*LDA (column stride).
- Initially had strides swapped (strideA1 and strideA2 reversed), which would have produced row-major instead of column-major interpretation. The zpotrf wrapper showed the correct mapping: `sa1=1, sa2=LDA` for column-major.
- The routine has 8 distinct code paths (2 parity x 2 transr x 2 uplo), each with different LDA values and array offsets. Getting the offset arithmetic right for each path required careful line-by-line translation.

## Dependency interface surprises

- `zherk` takes real scalars (alpha, beta as plain numbers), not Complex128. This matches the Fortran `DOUBLE PRECISION ONE` parameter.
- `ztrsm` takes a Complex128 scalar (alpha). The Fortran uses `CONE = (1.0D+0, 0.0D+0)`.
- The zpotrf base.js uses ndarray-style strides (strideA1, strideA2), not LDA. The mapping from Fortran's LDA to these strides is: strideA1=1 (row), strideA2=LDA (column) for column-major storage.

## Automation opportunities

- The ZTRTTF routine was needed in the Fortran test to convert full Hermitian matrices to RFP format. Without this helper, constructing RFP test inputs would have been very error-prone. Having both input and output in the fixture file was essential.
- The not-positive-definite tests needed one test per TRANSR/UPLO/parity combination (7 additional tests) to cover all the `info > 0` early-return branches.

## Coverage gaps

- The second zpotrf call in each branch (the one that returns `info + n1` or `info + k`) is uncovered. This would require a matrix where the first block is PD but the Schur complement (after the first factorization and update) is not PD. Constructing such matrices is non-trivial but not critical since the logic is just `return info + offset`.
- Line coverage: 94.74%, Branch coverage: 80.95%.

## Complex number handling

- zpftrf itself does not perform any complex arithmetic directly. It is purely a dispatch routine that partitions the RFP array and calls zpotrf, zherk, and ztrsm with appropriate offsets and strides.
- No reinterpret or manual Float64Array access needed since all complex operations are delegated to the dependency routines.
