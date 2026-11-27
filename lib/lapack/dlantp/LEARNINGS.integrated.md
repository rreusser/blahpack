# dlantp: Translation Learnings

## Translation pitfalls

- Fortran 1-based indexing to 0-based: the packed storage walk variable `k` starts at 0 instead of 1. For the Frobenius unit-diagonal case, `k` starts at 1 (to skip the first diagonal element), matching the Fortran `K = 2` adjusted by -1.
- The infinity-norm branch walks through packed elements sequentially (incrementing `k` by 1 in the inner loop), unlike max/one-norm which use range-based indexing. This matches the Fortran which uses `K = K + 1` in the inner loop.
- The `else { if (...) }` pattern triggers ESLint `no-lonely-if`; must flatten to `else if`.

## Dependency interface surprises

- `dlassq` returns `{ scl, sumsq }` (not positional). Must destructure as `out.scl` and `out.sumsq`.
- `dlassq` takes `(N, x, stride, offset, scale, sumsq)` -- the scale/sumsq are input values (not output arrays), and the return value carries updated state.

## Automation opportunities

- No new opportunities identified. The scaffold + deps pipeline worked smoothly.

## Coverage gaps

- All 4 norm types (max, one-norm, inf-norm, frobenius) are covered for both upper/lower and unit/non-unit, with 3x3, 4x4, 1x1, and N=0 cases. 42 tests total.
- NaN propagation is handled by the `sum !== sum` idiom but not explicitly tested via fixtures.

## Complex number handling

- N/A: dlantp is a real-valued routine.
