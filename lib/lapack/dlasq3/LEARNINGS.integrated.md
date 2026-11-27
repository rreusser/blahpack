# LEARNINGS — dlasq3

## Translation Pitfalls
- String parameters (`type`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.
- DLAMCH machine constants are replaced with JavaScript equivalents (Number.EPSILON, Number.MIN_VALUE, etc.) and hoisted to module scope.

## Dependency Interface Surprises
- No BLAS/LAPACK dependencies — this is a leaf routine.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `type` should be tested to ensure full branch coverage.

## Complex Number Handling
- N/A — real-valued routine.
