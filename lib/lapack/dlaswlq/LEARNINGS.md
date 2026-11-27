# dlaswlq: Translation Learnings

## Translation pitfalls

- **Fortran docstring error for T column count.** The reference docstring
  reads `T is dimension (LDT, N * Number_of_row_blocks)`, but actual usage
  (`T(1, CTR * M + 1)` in the loop) shows the column count is
  `M * Number_of_row_blocks`. Each panel writes an `MB`-by-`M` block. The
  `N` in the docstring is a long-standing LAPACK doc bug — trust the code.
- **Single-call fall-through has three triggers, not one.** The condition
  `(M >= N) .OR. (NB <= M) .OR. (NB >= N)` defers to a single `DGELQT`
  call. Missing any one of the three branches silently corrupts the
  output dimensions of T (T then has `M` columns, not
  `M * Number_of_row_blocks`).
- **Loop bound mirrors `dlatsqr` with M↔N swap exactly.** The structure
  is identical to dlatsqr's TSQR loop. In 0-based:
  `for (i = nb; i <= ii - (nb - M); i += nb - M)` with `ii = N - kk`.
  Treat dlatsqr/dlaswlq as a sibling pair when translating future
  variants (e.g. `zlaswlq`, `dlamswlq`).

## Dependency interface surprises

- **`dgelqt` does not take `strideWORK`.** Its base.js signature ends
  `..., WORK, offsetWORK`, while `dtplqt` has `..., WORK, strideWORK,
  offsetWORK`. The parent routine receives `strideWORK`/`offsetWORK`
  and forwards both to `dtplqt` but only `offsetWORK` to `dgelqt`.
- **`dtplqt` with `l=0` is the rectangular case.** Treating B as a
  purely rectangular block beneath/right-of A's triangular block is
  the correct call for both `dlatsqr` (rectangular below) and
  `dlaswlq` (rectangular to the right). The `l=0` flag selects this
  shape without any further dispatch.

## Coverage notes

- All three branches of the single-call early-return (`M >= N`,
  `nb <= M`, `nb >= N`) are exercised by Fortran test cases 3, 4,
  and 6 respectively; corresponding JS tests are
  `m3_n4_mb2_nb8_fallthrough`, `m3_n6_mb2_nb3_nbeqm`, and
  `m4_n4_mb2_nb6_square`.

## Missing automation

- The init_routine scaffold cannot guess the correct WORK-stride
  convention for parent routines that mix dependencies with and
  without `strideWORK`. The scaffolded `dlaswlq.js` had an extra
  `strideWORK` argument that does not appear in `dlatsqr.js`; we
  dropped it manually. Consider teaching the scaffold to mirror a
  named sibling module's argument list.
