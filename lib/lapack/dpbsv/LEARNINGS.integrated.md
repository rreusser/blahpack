# LEARNINGS — dpbsv

## Translation Pitfalls
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- String parameters (`uplo`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.

## Dependency Interface Surprises
- No BLAS/LAPACK dependencies — this is a leaf routine.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `uplo` should be tested to ensure full branch coverage.
- Edge cases for INFO return values (success and error paths) should be covered.

## Complex Number Handling
- N/A — real-valued routine.
