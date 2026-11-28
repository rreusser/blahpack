# LEARNINGS — dgbsv

## Translation Pitfalls
- IPIV arrays are 0-based in base.js (Fortran uses 1-based). Fixture comparisons must subtract 1 from Fortran IPIV values.
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- String parameters (`pivot`, `side`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.

## Dependency Interface Surprises
- No BLAS/LAPACK dependencies — this is a leaf routine.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `pivot`, `side` should be tested to ensure full branch coverage.
- Edge cases for INFO return values (success and error paths) should be covered.

## Complex Number Handling
- N/A — real-valued routine.
