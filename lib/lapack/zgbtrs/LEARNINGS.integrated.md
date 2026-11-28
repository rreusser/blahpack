# LEARNINGS — zgbtrs

## Translation Pitfalls
- IPIV arrays are 0-based in base.js (Fortran uses 1-based). Fixture comparisons must subtract 1 from Fortran IPIV values.
- String parameters (`trans`, `type`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.

## Dependency Interface Surprises
- No BLAS/LAPACK dependencies — this is a leaf routine.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `trans`, `type` should be tested to ensure full branch coverage.

## Complex Number Handling
- Complex routine — uses Complex128Array for array parameters and Complex128 for scalars.
