# dtpmqrt: Translation Learnings

## Translation pitfalls

- The Fortran source has four side-x-trans branches; two of them iterate
  forward over reflector blocks (left+T, right+N) and two iterate backward
  starting at `KF = ((K-1)/NB)*NB + 1` (left+N, right+T). In 0-based JS the
  backward start becomes `kf = floor((K-1)/nb) * nb`. The `(K-1)/NB`
  Fortran integer division must use `|0` (truncate-toward-zero), not
  `Math.floor`, but here `K-1 >= 0` so both give the same result.
- The per-block trapezoidal-rows count `LB` is `0` when `i >= L` and
  `MB - M + L - I + 1` (Fortran 1-based) otherwise. In 0-based JS this
  becomes `lb = mb - M + l - i` (note: no `+ 1` because `i` is 0-based and
  `mb` is already a 0-based count, not an index).
- The effective row count `MB = MIN( M-L+I+IB-1, M )` Fortran (1-based)
  becomes `mb = MIN( M-l+i+ib, M )` in 0-based JS (the `-1` and the `+1`
  on `i` cancel).
- Sister-routine reuse: structurally the four-branch dispatch is identical
  to dgemqrt. The only differences are (a) dtprfb instead of dlarfb,
  (b) the additional `lb` argument, and (c) the stacked `[A; B]` (left)
  / `[A B]` (right) layout means the per-block A pointer advances along
  rows (left, `+i*strideA1`) or columns (right, `+i*strideA2`) while B is
  passed without offset — only A is partitioned by block.

## Dependency interface surprises

- `dtprfb` requires `direct='forward'` and `storev='columnwise'` for the
  compact-WY format produced by `dtpqrt`. Long-form strings (`'left'`/
  `'right'`, `'no-transpose'`/`'transpose'`) match the canonical table —
  no aliasing needed.
- `dtprfb` takes the WORK matrix as `(WORK, strideWORK1, strideWORK2,
  offsetWORK)` — two strides, not one — so the caller must split its
  flat-stride WORK into row/column strides. Internally treated as
  `IB`-by-`N` (left) or `M`-by-`IB` (right) where `IB <= NB` is the
  current block's width.

## Workspace sizing

- The user-facing WORK requirement matches Fortran: `N*NB` doubles for
  `side='left'`, `M*NB` for `side='right'` (using the maximum `IB = NB`
  per Fortran convention). The internal-allocation fallback uses the
  same size.
- An earlier draft sized the internal buffer as `nb*nb` (left), which
  was too small whenever `N > nb` and produced silent NaN propagation
  through dtprfb. Always size the fallback by the worst-case dtprfb
  block: `IB`-by-`N` for left, `M`-by-`IB` for right.

## Fortran test compilation

- `deps.py` reports only `dtprfb` for dtpmqrt, but the Fortran test also
  uses `dtpqrt` to construct the V/T pair. The deps file must include
  `dtpqrt`, `dtpqrt2`, `dgeqrt`, `dgeqrt2`, `dgeqrt3`, `dlarfb`,
  `dlarfg`, `dlarft`, `dlapy2`, `dlamch`, `dnrm2`, `disnan`,
  `dlaisnan`, `ieeeck`, `iparmq`, `ilaenv` for `run_fortran.sh` to
  link a self-contained binary. (BLAS routines like `dgemm`/`dtrmm`/
  `dscal`/`dcopy`/`dgemv`/`dger`/`dtrmv`/`dswap`/`xerbla`/`lsame` are
  picked up automatically from `BLAS-3.12.0/`.)

## Coverage gap

- The single coverage gap on base.js (one branch on the WORK undersize
  guard) reflects the rare combination of a non-null but tiny user
  buffer being detected on entry. All four side/trans dispatch branches
  and the WORK=null fallback are exercised by tests.
