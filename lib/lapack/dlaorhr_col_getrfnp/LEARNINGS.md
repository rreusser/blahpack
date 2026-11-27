# dlaorhr_col_getrfnp: Translation Learnings

## Translation pitfalls

- The Fortran ILAENV(1, 'DLAORHR_COL_GETRFNP', ...) block size query is
  replaced with a hardcoded `NB = 32` per the project convention. When
  `NB <= 1` or `NB >= min(M,N)`, the routine delegates entirely to the
  recursive unblocked kernel `dlaorhr_col_getrfnp2`.
- Translated the 1-based panel loop `DO J = 1, MIN(M,N), NB` to 0-based
  `for ( j = 0; j < minMN; j += NB )` and adjusted all subsequent index
  arithmetic accordingly. The `J+JB-1` Fortran end index becomes `j + jb`
  in JS slice notation.
- Tests must exercise both the blocked path (M, N > NB = 32) and the
  unblocked fallback (small M, N). Used a 20x20 input matching the Fortran
  test program's `sin()`-based fill so fixture comparison stays exact.

## Dependency interface surprises

- `dlaorhr_col_getrfnp2` is called with sub-matrix offsets, never with
  re-sliced views; the strides remain the parent's full leading dimensions.
- The diagonal `D` slot is also offset (not re-sliced). The kernel writes
  `min(panel_M, panel_N)` entries starting at `offsetD + j*strideD`.
