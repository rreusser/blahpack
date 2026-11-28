# dlamswlq: Translation Learnings

## Translation pitfalls

- **`dlamswlq` is the LQ-side mirror of `dlamtsqr`.** `dlamtsqr` applies Q from
  TSQR (tall-skinny QR, A is `M`-by-`K` with reflectors stacked vertically by
  row block); `dlamswlq` applies Q from SWLQ (short-wide LQ, A is `K`-by-`X`
  with reflectors stacked horizontally by column block). The branch structure
  is identical but A-offsets switch from `i*strideA1` (dlamtsqr) to
  `i*strideA2` (dlamswlq), and the inner-kernel switches from `dgemqrt`/
  `dtpmqrt` to `dgemlqt`/`dtpmlqt`.
- **The block-iteration direction also swaps relative to dlamtsqr.** For the
  LQ variant, `(left, no-transpose)` and `(right, transpose)` iterate forward
  while `(left, transpose)` and `(right, no-transpose)` iterate backward.
  Translation looks like the dlamtsqr branches with the two `tran` cases
  swapped.
- **Workspace size differs between sides:** `LW = N*MB` for `side='left'` and
  `LW = M*MB` for `side='right'`. (In dlamtsqr this was `N*NB` / `MB*NB`.)
  Here `MB` is the compact-WY inner block, `NB` the LQ column block — the
  *opposite* meaning from dlamtsqr where `MB`/`NB` are the TSQR row/inner
  blocks. Always confirm the workspace formula from the routine's docstring.
- **Validator: `mb` (not `nb`) is the one bounded by `K`.** The Fortran rejects
  `K < MB .OR. MB < 1`, so the ndarray/wrapper guard is `1 <= mb <= K` when
  `K > 0`. `nb` only has to be a positive integer; the `nb > max(M,N,K)`
  fall-through is a dispatch decision, not a validation error.

## Dependency interface surprises

- **`dgemlqt(side, trans, M, N, K, mb, V, ...)` and
  `dtpmlqt(side, trans, M, N, K, l, mb, V, ...)`** — the inner block size
  is named `mb` in both kernels, matching the SWLQ convention. Pass through
  `mb` from `dlamswlq`'s parameter, not `nb` (a subtle name collision with
  the dlamtsqr/TSQR analog where the inner block was called `nb`).
- **T column offset uses `ctr * K * strideT2`** in all four branches — same
  as dlamtsqr. `T` is logically `mb`-by-`numblk*K`, stacked block-by-block
  along the second dimension.

## Coverage notes

- All four `(side, trans)` combinations + the fall-through path are tested
  via three structurally distinct factor cases (genuine partition, trailing
  partial block, even-divide) plus a degenerate fall-through case.
- Quick-return paths (`M=0`, `N=0`, `K=0`) are tested directly via the
  ndarray entry point.

## Process notes

- The Fortran test driver needs `DLASWLQ` (and its transitive deps
  `dgelqt`, `dgelqt3`, `dtplqt`, `dtplqt2`, `dlarfb`, `dlarfg`, `dtprfb`,
  `dlapy2`, `disnan`, `dlaisnan`, `dlamch`, plus the `ilaenv` cluster) in
  `deps_dlamswlq.txt` to seed the factorization in Fortran, even though
  `dlamswlq` itself doesn't call `dlaswlq`. `python bin/deps.py dlamswlq`
  only enumerates JS deps and misses these. Cross-check by reading the
  Fortran test driver and grepping for `CALL` statements in `dlaswlq.f`.
