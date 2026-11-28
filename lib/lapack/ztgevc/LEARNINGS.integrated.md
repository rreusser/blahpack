# LEARNINGS — ztgevc

## Translation Pitfalls
- Complex arrays use `reinterpret()` at function entry for Float64Array views; strides and offsets are multiplied by 2 for Float64 indexing.
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- String parameters (`direct`, `howmny`, `side`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.
- DLAMCH machine constants are replaced with JavaScript equivalents (Number.EPSILON, Number.MIN_VALUE, etc.) and hoisted to module scope.

## Dependency Interface Surprises
- Dependencies: `reinterpret-complex128`, `zgemv`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `direct`, `howmny`, `side` should be tested to ensure full branch coverage.
- Edge cases for INFO return values (success and error paths) should be covered.
- Workspace allocation paths are exercised through the standard test cases.

## Complex Number Handling
- Uses `reinterpret()` to obtain Float64Array views of Complex128Array inputs. Strides and offsets are doubled for Float64-level indexing.
