# LEARNINGS — dlasq1

## Translation Pitfalls
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.
- DLAMCH machine constants are replaced with JavaScript equivalents (Number.EPSILON, Number.MIN_VALUE, etc.) and hoisted to module scope.

## Dependency Interface Surprises
- Dependencies: `dcopy`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- Edge cases for INFO return values (success and error paths) should be covered.
- Workspace allocation paths are exercised through the standard test cases.

## Complex Number Handling
- N/A — real-valued routine.
