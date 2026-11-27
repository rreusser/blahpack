# LEARNINGS — zgbtf2

## Translation Pitfalls
- Complex arrays use `reinterpret()` at function entry for Float64Array views; strides and offsets are multiplied by 2 for Float64 indexing.
- IPIV arrays are 0-based in base.js (Fortran uses 1-based). Fixture comparisons must subtract 1 from Fortran IPIV values.
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- String parameters (`pivot`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.

## Dependency Interface Surprises
- Dependencies: `cmplx.js`, `izamax`, `reinterpret-complex128`, `zgeru`, `zscal`, `zswap`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `pivot` should be tested to ensure full branch coverage.
- Edge cases for INFO return values (success and error paths) should be covered.
- Workspace allocation paths are exercised through the standard test cases.

## Complex Number Handling
- Uses `reinterpret()` to obtain Float64Array views of Complex128Array inputs. Strides and offsets are doubled for Float64-level indexing.
- Complex arithmetic uses `cmplx.div` from the shared cmplx module. Division and absolute value are never inlined (numerical stability).
