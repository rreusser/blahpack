# LEARNINGS — zggbak

## Translation Pitfalls
- INFO return value remains 1-based (matching Fortran convention): 0 = success, k > 0 = algorithmic outcome at position k.
- String parameters (`job`, `side`, `type`) use single-char Fortran convention in base.js; ndarray.js normalizes from stdlib full-word strings.
- Quick-return conditions must be preserved exactly as in Fortran reference to handle edge cases (N=0, alpha=0, etc.) correctly.

## Dependency Interface Surprises
- Dependencies: `zdscal`, `zswap`. No unexpected interface issues encountered.

## Missing Automation
- N/A — translated via automated pipeline.

## Coverage Gaps
- Tests exist and validate against Fortran reference fixtures.
- All parameter combinations for `job`, `side`, `type` should be tested to ensure full branch coverage.
- Edge cases for INFO return values (success and error paths) should be covered.

## Complex Number Handling
- Complex routine — uses Complex128Array for array parameters and Complex128 for scalars.
