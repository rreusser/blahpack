# zgeqlf: Translation Learnings

## Translation pitfalls

- The Fortran blocked loop `DO 10 I = K-KK+KI+1, K-KK+1, -NB` relies on
  the post-loop value of `I` being `K-KK+1-NB` (the first value that
  fails the test). The trailing unblocked `ZGEQL2(MU, NU, ...)` uses
  `MU = M-K+I+NB-1` and `NU = N-K+I+NB-1`, which simplify to
  `MU = M-KK`, `NU = N-KK`. With `nx=0` (matching the zgeqrf JS
  translation) and `kk < K` never occurring, `MU = M-K`, `NU = N-K`,
  and the trailing call only has work to do when the matrix is
  rectangular — in which case `min(MU, NU) = 0` so it harmlessly
  skips. This is different from zgeqrf, where the panels grow from
  the top-left.

- Panel geometry is "grows-from-top-bottom-right": each block factors
  `(M-K+I+IB-1) x IB` complex entries (in 1-based: rows 1..M-K+I+IB-1
  and columns N-K+I..N-K+I+IB-1). The panel leading edge is anchored
  at row 0 and the right column of the current block; translate
  carefully to 0-based as `rows = M-K+i+ib`, `col_start = N-K+i`.

- The `N-K+I > 1` guard in Fortran (skip zlarft/zlarfb when the block
  already covers the leftmost column) becomes `N-K+i > 0` in 0-based.

## Dependency interface surprises

- Workspace layout matches zgeqrf: scratch buffer is placed at
  `offsetWORK` with leading dim `ldwork=N`; the block reflector T is
  placed immediately after at `offsetT = offsetWORK + iws` with stride
  `(1, nb)`. Total WORK size: `N*nb + nb*nb` complex elements.

- `zlarfb` uses separate `strideWORK1, strideWORK2` parameters (it
  treats WORK as a 2D matrix, not a 1D strided array).

- `zlarft`/`zlarfb` direction for QL is `'backward'` + `'columnwise'`
  (compare to `'forward'` + `'columnwise'` for QR).

## Complex number handling

- All dependencies (`zgeql2`, `zlarft`, `zlarfb`) take `Complex128Array`
  with complex-element strides. `zgeqlf` just forwards its strides and
  offsets; no reinterpret was needed in this routine itself.
