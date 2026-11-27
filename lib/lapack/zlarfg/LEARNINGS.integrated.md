# LEARNINGS — zlarfg

## Translation Pitfalls
- Complex arrays use `reinterpret()` at function entry for Float64Array views; strides and offsets are multiplied by 2 for Float64 indexing.
- DLAMCH machine constants are replaced with JavaScript equivalents (Number.EPSILON, Number.MIN_VALUE, etc.) and hoisted to module scope.

## Dependency Interface Surprises
- Dependencies: `cmplx.js`, `dznrm2`, `reinterpret-complex128`, `zdscal`, `zscal`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- Workspace allocation paths are exercised through the standard test cases.

## Complex Number Handling
- Uses `reinterpret()` to obtain Float64Array views of Complex128Array inputs. Strides and offsets are doubled for Float64-level indexing.
- Complex arithmetic uses `cmplx.div` from the shared cmplx module. Division and absolute value are never inlined (numerical stability).
