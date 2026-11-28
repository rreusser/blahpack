# dgbtf2: Translation Learnings

## Translation pitfalls

- Band matrix storage is the most complex indexing in LAPACK. The diagonal
  is at row KV (0-based, where KV = KU+KL), NOT at the center of the band.
  The first KL rows are reserved for fill-in from pivoting.
- IPIV is 0-based in JS (Fortran is 1-based). The IPIV values represent
  the row swapped with row j: `IPIV[j] = jp + j` (0-based global row index).
- The dswap calls use stride `sa2 - sa1` (= LDAB - 1 in Fortran) to walk
  along a row of the band matrix. This is because moving one column right
  and one band-row up is the stride for row elements in band storage.
- dger's leading dimension for the rank-1 update is also `sa2 - sa1` since
  U elements span across columns at different band rows.

## Dependency interface surprises

- idamax returns 0-based index (matching stdlib convention), so no adjustment
  needed for jp.
- dswap, dscal, dger all use the stride/offset API consistently.

## Automation opportunities

- Band matrix construction in Fortran tests required careful manual setup.
  A Fortran helper to build band storage from a dense matrix would help.

## Coverage gaps

- 100% line and branch coverage achieved.
- Tests cover: tridiagonal, pentadiagonal, non-square bandwidth (KL!=KU),
  1x1, singular matrix, tall matrix (M>N), and pivoting.

## Complex number handling

- N/A - double precision only.
