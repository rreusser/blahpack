# dopgtr: Translation Learnings

## Translation pitfalls

- The packed storage index traversal (IJ variable) is tricky: in the upper case, IJ starts at 1 (0-based), skips 2 after each column (past diagonal and first element of next column). In the lower case, IJ starts at 2 (0-based), skips 2 after copying each column's sub-diagonal elements.
- The upper case calls dorg2l on Q(0:N-2, 0:N-2), which conveniently starts at the same offset as Q. The lower case calls dorg2r on Q(1:N-1, 1:N-1), requiring an offset shift of strideQ1 + strideQ2.

## Dependency interface surprises

- dorg2l and dorg2r both take a full set of stride/offset params, matching the ndarray convention. The submatrix offset for the lower case is computed as offsetQ + strideQ1 + strideQ2 to point at Q(1,1).

## Automation opportunities

- The packed-to-full unpacking pattern (IJ traversal with skip 2) appears in several packed-storage routines (dsptrd, dopgtr, dopmtr). Could be extracted into a helper.

## Coverage gaps

- None significant. The Fortran test fixtures cover both upper and lower cases for N=0, 1, 2, 3, and 4, plus direct calls with pre-computed AP/TAU from DSPTRD.

## Complex number handling

- N/A: dopgtr is a real-valued routine.
