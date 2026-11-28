# zungtr: Translation Learnings

## Translation pitfalls

- Direct mirror of dorgtr with complex arithmetic. The main gotcha is the `reinterpret()` pattern: all array access uses Float64 views with doubled strides/offsets (`sa1 = strideA1 * 2`, `oA = offsetA * 2`), while function calls to zungql/zungqr pass the original complex-element strides.
- Setting complex zero `(0, 0)` and complex one `(1, 0)` requires writing two Float64 values per element.

## Dependency interface surprises

- zhetrd and zungtr both use long-form `'upper'`/`'lower'` strings (not `'U'`/`'L'`). Initially the test passed `'U'`/`'L'` to zhetrd which caused incorrect results. All routines in this codebase use long-form strings at the base.js level.

## Automation opportunities

- N/A: implementation already existed; only tests were written.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- Tests use zhetrd + zungtr pipeline (matching the Fortran test pattern) plus unitarity verification (Q^H * Q = I).

## Complex number handling

- Column shift loop inlines complex element copies (two Float64 writes per complex element).
- zungql and zungqr are called via `require()` -- no complex arithmetic inlined for the actual Q generation.
