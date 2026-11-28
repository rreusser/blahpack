# dtptri: Translation Learnings

## Translation pitfalls

- The upper packed singularity check has a subtle 0-based indexing issue. The Fortran code uses `JJ = 0; DO INFO = 1, N; JJ = JJ + INFO` which means JJ accumulates as 1, 3, 6 (1-based). Converting naively with `jj += k` (where k is 0-based) gives 0, 1, 3 instead of the correct 0, 2, 5 (0-based). The fix is `jj = -1; jj += k + 1` to match the Fortran triangular number sequence.
- The lower triangular `JC` update formula `JC = JC - N + J - 2` (Fortran, 1-based) converts to `jc = jc - (N - j + 1)` in 0-based, NOT `jc = jc - (N - j)`. Missing the extra -1 causes the column pointer to land one position too high, producing garbage results for all lower triangular cases.
- Both bugs only affect the lower triangular and singularity paths, so the upper triangular inversion can pass while lower is completely wrong.

## Dependency interface surprises

- `dtpmv` base.js takes `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- the packed matrix and vector share the same array when computing in-place, which works because dtpmv processes elements in the correct order.
- `dscal` base.js takes `(N, da, x, strideX, offsetX)` -- straightforward.

## Automation opportunities

- The packed storage diagonal index calculation (triangular numbers) appears in multiple packed routines (dtptrs, dtpmv, dtptri). A shared helper for computing the k-th diagonal position in upper/lower packed format would prevent these off-by-one bugs.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- The stride/offset test validates non-unit stride support.
- Unit diagonal tests verify that diagonal values are ignored when diag='unit'.

## Complex number handling

- N/A: dtptri is a real-valued routine.
