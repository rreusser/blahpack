# LEARNINGS — dlacn2

## Translation Pitfalls
- String parameters (`norm`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.

## Dependency Interface Surprises
- Dependencies: `dasum`, `dcopy`, `idamax`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `norm` should be tested to ensure full branch coverage.

## Complex Number Handling
- N/A — real-valued routine.
