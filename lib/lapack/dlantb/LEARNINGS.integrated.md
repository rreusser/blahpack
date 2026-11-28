# dlantb: Translation Learnings

## Translation pitfalls

- Band storage index mapping requires careful Fortran-to-JS 0-index translation. For upper triangular, the diagonal is at band row K (0-indexed), and for lower triangular, the diagonal is at band row 0. The Fortran `AB(K+1+i-j, j)` maps to `AB[offsetAB + (K+i-j)*strideAB1 + (j-1)*strideAB2]` in 0-indexed JS (with 0-indexed i,j).
- The infinity-norm uses an auxiliary variable `l` to compute the band row index from the matrix row index: for upper, `l = K - j`; for lower, `l = -j`. This keeps the inner loop indexing clean.
- `dlassq` returns `{scl, sumsq}` (not `{scale, sum}`) -- must destructure correctly.

## Dependency interface surprises

- `dlassq` in this codebase uses Blue's scaling constants and returns an object `{scl, sumsq}`, not positional output parameters like the Fortran version. The Fortran `CALL DLASSQ(N, X, INCX, SCALE, SUM)` modifies SCALE and SUM in-place; the JS version returns a new object.

## Automation opportunities

- The Fortran deps file generator (`deps.py`) missed `la_constants` and `la_xisnan` which are required for `dlassq.f90` compilation. These had to be manually added.

## Coverage gaps

- All four norm types (max, one-norm, inf-norm, frobenius) tested for both upper/lower and unit/non-unit diagonals.
- Edge cases covered: N=0, 1x1 matrix (K=0), pure diagonal matrix (K=0), and K=1 bandwidth.
- NaN propagation not explicitly tested but handled by the `temp !== temp` idiom.

## Complex number handling

- N/A: dlantb is a real-valued routine.
