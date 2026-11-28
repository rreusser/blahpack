# dtrti2: Translation Learnings

## Translation pitfalls

- [x] The lower triangular case calls dtrmv on the submatrix A(j+1:N, j+1:N) to transform column A(j+1:N, j). The offset for the submatrix diagonal is `offsetA + (j+1)*sa1 + (j+1)*sa2`, and the column being transformed starts at `offsetA + (j+1)*sa1 + j*sa2`. Getting these offsets right requires careful attention to the Fortran 1-based to JS 0-based index translation.
- [x] The guard `if (j < N-1)` in the lower triangular path prevents calling dtrmv/dscal with count=0 when j is the last column. The Fortran source uses `IF (J.LT.N)` which maps directly.
- [x] The sign of ajj: the Fortran sets `AJJ = -A(J,J)` after inverting the diagonal. This negation is critical because dscal multiplies the column by ajj, effectively subtracting the contribution.

## Dependency interface surprises

- [x] DTRMV's stride/offset API aligns well with passing submatrix views. The Fortran `CALL DTRMV('Upper', 'No transpose', DIAG, J-1, A, LDA, A(1,J), 1)` maps to `dtrmv('U', 'N', diag, j, A, sa1, sa2, offsetA, A, sa1, offsetA + j*sa2)` where the column vector uses sa1 as its stride (walking down column j).
- [x] DSCAL's 3-argument form (N, alpha, x, stride, offset) works cleanly for both upper and lower paths.

## Automation opportunities

- [x] The upper and lower paths are symmetric. A template could generate both from the same specification with reversed loop direction and swapped submatrix positions.

## Coverage gaps

- [x] Achieved 100% line, branch, and function coverage for dtrti2 itself with 7 tests: upper/lower x non-unit/unit diag, N=0, N=1, and identity matrix.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (ztrti2) would use the same structure with complex arithmetic.
