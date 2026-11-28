# dtplqt: Translation Learnings

## Translation pitfalls

- **`mb` exposed as a JS parameter, not workspace-queried.** The Fortran
  reference takes `MB` directly (no ILAENV inquiry), so we mirror that:
  `mb` is the 4th positional arg in both `dtplqt` (layout wrapper) and
  `dtplqt.ndarray`. No `DEFAULT_NB` constant in `base.js`. This keeps
  the routine's behavior fully deterministic and lets callers tune the
  block size for the surrounding driver. The wrapper validates
  `1 <= mb` and (if `M > 0`) `mb <= M`.
- **`T` is `mb`-by-`M`, not `M`-by-`M` or `mb`-by-`N`.** Per panel,
  `dtplqt2` writes an `ib`-by-`ib` upper-triangular factor at
  `T(:, panel_start_col:panel_end_col)`. Across the whole driver the
  panel starts cover columns `0..M-1` (one column of `T` per column of
  `A`). So tests must allocate `T = new Float64Array(mb * M)`, **not**
  `mb * N`. My initial allocation used `mb * N` and produced length
  mismatches on every blocked case. The Fortran spec wording
  "dimension `(LDT, N)`" is misleading — the operative size is `mb*M`.
- **`LB` formula collapses cleanly in 0-based.** Fortran:
  `IF(I.GE.L) LB=0 ELSE LB=NB-N+L-I+1`. With `i = I_fortran - 1`:
  - condition `I.GE.L` becomes `i + 1 >= l`
  - else branch becomes `lb = nb - N + l - i` (the +1 cancels the −1)
- **`signature-conformance` lint warning is a known false positive
  here.** The lint rule expects 16 params for a 3-matrix LAPACK signature
  (M, N + 1 scalar + 3 × {array, s1, s2, off}). dtplqt has 19 because
  of the extra `mb` scalar parameter and the 1D `WORK` array (3 params:
  array, stride, offset). Same shape as other blocked drivers. Documented
  via the existing tooling expectation, no fix needed.
- **Quick-return condition is just dimensions** (`M==0 || N==0`).
  Unlike many BLAS-3 routines there is no compound `(alpha==0 && beta==1)`
  branch to worry about.

## Dependency interface surprises

- **`dtprfb` `WORK` is a 2D matrix with caller-chosen leading dim.**
  Its signature is `(..., WORK, strideWORK1, strideWORK2, offsetWORK)`.
  Inside `dtplqt`, the leading dim changes per iteration
  (`LDWORK = M - i - ib`), so the cleanest mapping is to pass a flat
  1D `WORK` from the driver (so base.js takes `WORK, strideWORK,
  offsetWORK`) and synthesize `strideWORK1 = strideWORK,
  strideWORK2 = (M - i - ib) * strideWORK` at each call. Don't try to
  promote `WORK` to a 2D `(strideWORK1, strideWORK2)` interface at the
  driver level — it would be wrong on every iteration after the first.
- **`dtprfb` row/forward/right path with `l=0` was previously
  un-exercised by `test_dtprfb.f90`.** That branch is now covered
  through `dtplqt`'s tests for `l=0` cases. (Not a bug — it just means
  this is the first code path reaching it through the dependency chain.)
- **`dtplqt2` interface (Householder reflectors, T factor build) is
  documented in its own `LEARNINGS.md`.** The driver only needs to
  know that `dtplqt2(IB, NB, LB, A_panel, B_panel, T_panel)` writes
  `T(0:IB-1, 0:IB-1)` of the panel sub-matrix — which combined with the
  per-panel column offset yields the `mb*M` packed layout above.

## Fortran test gotcha

- **Print only the meaningful submatrix of T.** Fortran's `T(LDT, N)`
  declared shape masks the fact that only `T(1:MB, 1:M)` carries
  data. Print exactly that with
  `call print_matrix('T', T, ldt_padding, MB, M)`. Otherwise the
  fixture would include trailing zeros from beyond the panels and
  test-side allocation has to match.

## Coverage

- 100% line / 100% branch / 100% function on `base.js` with 9
  fixture-driven cases (covering `l=0` and `l>0`, `mb=1`/`mb=M`/
  intermediate, multi-panel and single-panel, and the `M=0`/`N=0`
  quick-return paths).
