# LEARNINGS — zdrot

## Translation Pitfalls
- Complex arrays use `reinterpret()` at function entry for Float64Array views; strides and offsets are multiplied by 2 for Float64 indexing.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.

## Dependency Interface Surprises
- Dependencies: `reinterpret-complex128`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.

## Complex Number Handling
- Uses `reinterpret()` to obtain Float64Array views of Complex128Array inputs. Strides and offsets are doubled for Float64-level indexing.
