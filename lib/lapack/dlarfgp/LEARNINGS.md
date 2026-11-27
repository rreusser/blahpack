# dlarfgp: Translation Learnings

## Translation pitfalls

- `dlarfgp` is nearly a line-by-line translation of `dlarfg` with two
  differences: (1) the initial `xnorm <= EPS*|alpha|` quick-return branch
  that enforces `beta >= 0` even when `x` is effectively zero, and (2) the
  `beta >= 0` half of the main `beta` sign dispatch, which uses the
  cancellation-avoiding identity
  `alpha := xnorm*(xnorm/(alpha+beta))` before forming `tau`.
- The Fortran `SIGN(DLAPY2(ALPHA,XNORM), ALPHA)` here does NOT negate the
  sign (unlike `dlarfg`, which multiplies by `-sign`), so the computed
  `beta` shares `alpha`'s sign. The `if (beta < 0)` branch is what
  eventually flips it to a non-negative final value.
- The `n_zero` fixture asserts `tau == 0` after the `N <= 0` quick return
  because the Fortran source unconditionally writes `TAU = ZERO` before
  returning. Initially added `if (N === 0) return;` short-circuits to
  `ndarray.js` / the BLAS-style wrapper; these must be removed so that
  `base.js` actually runs and zero-sets `tau`. Caught by the `n_zero`
  fixture.

## Dependency interface surprises

- `dlamch` expects long-form string arguments `'precision'`,
  `'safe-minimum'`, `'epsilon'` — check the dispatch table in
  `lib/lapack/base/dlamch/lib/base.js` before using.
- `dnrm2` / `dscal` are 0-based `(N, ..., x, strideX, offsetX)` — same as
  other BLAS leaves.

## Coverage gaps

- The denormal-`tau` flush branch (`Math.abs(tau) <= SMLNUM`) is
  effectively unreachable in IEEE 754 double precision. After the general
  branch is taken, we have `xnorm > EPS*|alpha|`, which yields
  `tau >= EPS^2 ~ 1.2e-32`, many orders of magnitude above
  `SMLNUM ~ 4.5e-292`. An inline `NOTE` comment at the branch records
  this and we accept the ~7% line gap. Overall coverage is 93.06% line,
  96% branch on `base.js` — above the 90%/85% thresholds.

## Process improvements

- `init_routine.py` overwrites `test/test.js` with the `gen_test.py`
  TODO-stub scaffold (one stub per fixture case) even though the scaffold
  already produces the standard "main export is a function" template. For
  routines where the fixture is keyed to `test/test.ndarray.js` (which is
  the norm), this forces a manual rewrite back to the export-check
  template. Consider making `init_routine.py` skip `test.js` regeneration
  when the file already contains the export-check template.
- The `codemod-tests.js` section-header spacing rule (3d/3e) inserts two
  blank lines before `// MODULES //`, which then conflicts with the
  `stdlib/section-header-empty-lines` ESLint rule that requires exactly
  one blank line after a top-of-file `'use strict';` directive. Manual
  fixup required whenever a new test file has only a license block (no
  leading `/* eslint-disable */` comment). Consider patching the codemod
  to look back past `'use strict';` and emit a single blank line in that
  case.
- The scaffolded benchmark `benchmark.js` / `benchmark.ndarray.js` use
  the wrong call signature (`dlarfgp(N, 1.0, x, N, N)` — scalar `alpha`,
  `stride=N`, etc.) which would silently allocate a degenerate work
  array. Had to rewrite them to match the `(N, alphaArr, oAlpha, x,
  strideX, [offsetX,] tauArr, oTau)` API and reset inputs per iteration.
  `init_routine.py`/`scaffold.py` should generate a wrapper-aware
  benchmark from the signature rather than a generic BLAS template.
