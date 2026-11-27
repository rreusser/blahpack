# dlatrz: Translation Learnings

## Translation pitfalls

- The reflector tail `v` passed to `dlarz` is stored in row `i` of `A`
  starting at column `N-l` with element-stride `strideA2` (i.e. it
  walks across columns). This is NOT `strideA1`.
- The sub-matrix `C` passed to `dlarz` is `A(0:i-1, i:N-1)` — i.e.
  row 0 to row `i-1`, column `i` to column `N-1`. Its offset therefore
  needs only a column shift of `i * strideA2`; the row start is `0`.
- The Fortran reflector length is `L+1` (one pivot + `L` tail elements).
  The leading "1" of the Householder vector implicit in `dlarz` is
  the pivot, and only the `l`-element tail is stored explicitly after
  `dlarfg` returns.

## Dependency interface surprises

- `dlarfg( n, A, offsetAlpha, X, strideX, offsetX, TAU, offsetTAU )`
  takes `alpha` as an `(array, offset)` pair — the pivot element is
  updated in place.
- `dlarz` takes `tau` as a plain scalar `number`, not array+offset.
