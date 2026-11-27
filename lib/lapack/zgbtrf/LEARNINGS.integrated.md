# LEARNINGS — zgbtrf

## Translation Pitfalls
- IPIV arrays are 0-based in base.js (Fortran uses 1-based). Fixture comparisons must subtract 1 from Fortran IPIV values.

## Dependency Interface Surprises
- No BLAS/LAPACK dependencies — this is a leaf routine.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.

## Complex Number Handling
- Complex routine — uses Complex128Array for array parameters and Complex128 for scalars.
