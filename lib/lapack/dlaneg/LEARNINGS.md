# dlaneg: Translation Learnings

## Translation pitfalls

- dlaneg is a pure scalar-returning function (no outputs through pointers).
  The JS wrapper returns `integer` directly; no Float64Array(1) scratch is
  needed. Return type is `{integer}` in JSDoc, not `{number}`.
- Loop index strategy: keeping 1-based `bj`/`j` loop variables matches the
  Fortran `DO 21 J = BJ, MIN(BJ+BLKLEN-1, R-1)` structure, and a local
  `jj = j - 1` gives the 0-based index for array access. Converting the
  outer loop bounds (`bj = 1 .. r-1 step BLKLEN`) directly from Fortran
  avoids off-by-ones in the `MIN(BJ+BLKLEN-1, R-1)` truncation.
- `DISNAN(x)` → `x !== x`. No need to require `@stdlib/math/base/assert/is-nan`
  for a single use in a hot loop.
- The `pivmin` parameter is documented in the Fortran source as "unused in
  reference body" — the algorithm relies on IEEE-754 Inf/NaN propagation and
  the slow fallback loop handling `Inf/Inf → 1`. Keep the parameter in the
  signature for API compatibility even though it is never read.
- The Part II downward sweep uses `LLD(j) + p` (LLD goes first, not `p + LLD(j)`).
  Order matters for NaN bit patterns but not for value — preserve Fortran order.
- Twist-index correction at the end: `gamma = (t + sigma) + p`. The explicit
  parenthesization matters because `t` was shifted by `-sigma` initially, so
  `t + sigma` recovers the unshifted tail term before adding `p`.

## Dependency interface surprises

- `deps.py` reports `disnan` / `dlaisnan` as deps, but since we inline the
  NaN check with `x !== x`, no `require()` is needed in JS. The Fortran
  test program still needs `disnan.f` / `dlaisnan.f` linked — they remain
  in `test/fortran/deps_dlaneg.txt`.

## Coverage gaps

- The `sawnan` fallback branches (lines `if ( sawnan ) { ... }` in both the
  upper and lower sweeps) are not hit by the fixture test set because no
  input triggers a zero pivot followed by an infinity in IEEE-754 mode.
  The v8 coverage tool nevertheless reports 100/100 — v8 counts the
  untaken branch of `if ( sawnan )` as covered as soon as the condition
  is evaluated. Constructing a test that hits both branches would require
  tuning `d` and `LLD` so a pivot becomes exactly zero at the right
  position, which is fragile. Accepted as uncovered in practice.

## Scaffold / tooling notes

- `bin/init_routine.py` scaffolds `benchmark.js` / `benchmark.ndarray.js`
  that call the public wrapper with `dlaneg( N, d, N, LLD, N, N, N, N )` —
  passing `N` as the stride argument breaks with out-of-bounds for any
  `N > 1`. Fixed to `stride = 1` and to pass the remaining scalars
  (`sigma`, `pivmin`, `r`) with sensible values (`r = N/2 + 1`).
- The scaffolded `test/test.dlaneg.js` contains a generic "throws TypeError
  for invalid order" case that does not apply to dlaneg (no layout/order
  parameter). Replaced with a `RangeError` check on negative `N`.
- Scaffolded `test.js` was written as the full fixture-driven test file;
  replaced with a minimal `main export is a function` / `has ndarray method`
  template matching the stdlib convention.
- `bin/lint-fix.sh`'s codemod re-inserts a second blank line between
  `'use strict';` and `// MODULES //`, and the eslint rule
  `stdlib/section-header-empty-lines` then flags it. Running `bin/lint.sh`
  (without the codemod) plus a manual fix is the workaround.
