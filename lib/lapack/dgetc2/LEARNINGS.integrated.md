# dgetc2: Translation Learnings

## Translation pitfalls

- IPIV/JPIV are 0-based in JS vs 1-based in Fortran. The gen_test.py scaffold handles the -1 conversion in test assertions.
- The `smin` variable must be initialized before the loop (set in the i=0 iteration). Fortran relies on first-iteration initialization; JS needs explicit `smin = 0.0` before the loop.
- dswap is called on both rows (stride = strideA2) and columns (stride = strideA1) for complete pivoting.

## Dependency interface surprises

- dswap takes two separate arrays with strides, not a single array. Row swap: `dswap(N, A, strideA2, rowOffset1, A, strideA2, rowOffset2)`.
- dger signature: `(M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA)` -- x is column, y is row.

## Automation opportunities

- N/A for this routine.

## Coverage gaps

- Near-singular path (INFO > 0 with smin replacement) tested with 1e-200 values.
- N=0 quick return is trivially covered.

## Complex number handling

- N/A: dgetc2 is a real-valued routine.
