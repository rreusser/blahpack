# dorbdb6: Translation Learnings

## Translation pitfalls

- `signature.py` emitted both `strideX1, offsetX1, incx1` (and analogously
  for X2) for vectors that already have an `INCX` parameter in Fortran.
  The correct stdlib-js signature consumes `INCX` into `strideX` — only
  one stride/offset pair is needed per array. Trust the BLAS-style
  signature pattern (`x, strideX, offsetX`) over the raw scaffolder output
  for routines whose Fortran already carries an `INCX`-style increment.
- The Fortran's `LWORK` parameter is dropped in JS (workspace is
  caller-supplied with stride/offset). Drop it from both the wrapper and
  the ndarray API to stay consistent with the rest of the codebase.
- `DLAMCH('Precision')` (used here) is *not* the same as `DLAMCH('Epsilon')`.
  `Precision = Epsilon * Base = 2^-53 * 2 = 2^-52 = Number.EPSILON`. The
  SKILL.md "Fortran Idioms" table only covers `'E'` (which maps to
  `Number.EPSILON / 2`); the `'P'` (Precision) flavor maps directly to
  `@stdlib/constants/float64/eps` (= `Number.EPSILON`). Adding a row to
  that table for `'P'` would prevent future confusion.
- The Fortran second-pass quick-zero block redundantly zeroes `WORK` even
  when `M1=0` (the M1=0 branch immediately re-zeroes it). Preserved the
  intent in the JS `project()` helper which always handles the M1=0 case
  inline; no need to mirror the redundant outer zero-loop.
- `DGEMV('C', ...)` for a real matrix means `'transpose'` in stdlib-js
  (real `'C'` is mathematically `'T'`). Used `'transpose'` in both
  forward and back projections.

## Dependency interface surprises

- `dlassq` returns an object `{scl, sumsq}` (not in/out scalars). Helper
  `norm2()` chains two calls cleanly: pass the first call's `r.scl`/
  `r.sumsq` into the second.
- `dgemv` here is the column-major `base.js` version with stride-pair
  matrix indexing (`strideA1, strideA2, offsetA`). The wrapper handles
  layout → stride conversion; base never sees an `LDQ` parameter.

## Coverage gaps

- The "second-pass also shrank" branch (truncate-to-zero after
  reorthogonalization fails) is unreachable when `Q` is truly orthonormal
  — that's the Giraud/Langou/Rozložník guarantee the routine is built on.
  Tried with a deliberately non-orthonormal Q (column 2 ≈ column 1) and
  the gate still wasn't triggered. Marked the branch with an inline TODO
  and accepted the 92.86% branch coverage. Still well above the 85%
  hard-gate threshold.

## Test-design notes

- The Fortran reference test had to be split into two phases: the
  fixture-generating tests (success paths) live in `test_dorbdb6.f90`,
  while invalid-argument tests are JS-only. Reason: the LAPACK
  reference's `XERBLA` aborts the program on first illegal-arg call,
  making it impossible to produce a fixture line for those cases.
  Pattern is reusable for any LAPACK routine with `XERBLA`-style
  validation.
- Used `buildQ(LD, cols, [[row, col, value], ...])` helper to construct
  sparse Q matrices in column-major form. Cleaner than nested zero/set
  loops, especially for fixtures matching Fortran's NMAX=8 padding.

## Process improvements

- The `init_routine.py` scaffold emits the wrong arity in
  `test/test.<routine>.js` — it counts the raw signature args including
  the duplicated `incx*`/`lwork` slots. Worth either dropping those
  before counting, or surfacing the choice to the agent. For now,
  always re-derive arity from the actual `dorbdb6.js` wrapper.
- `gen_test.py` produced a useful skeleton but the inputs (Q, X, WORK
  buffer sizes) had to be reconstructed by hand. The fixture only
  records *outputs*; the inputs are encoded in the Fortran test source.
  An "include the inputs in the fixture" feature in `test_utils` would
  eliminate this manual reconstruction step.
