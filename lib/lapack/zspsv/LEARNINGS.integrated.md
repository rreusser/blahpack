# zspsv: Translation Learnings

## Translation pitfalls

- None: zspsv is a thin driver that delegates entirely to zsptrf + zsptrs.
  No index arithmetic, no complex math, no stride manipulation.

## Dependency interface surprises

- zsptrf and zsptrs use 0-based IPIV with bitwise NOT (~) for 2x2 pivots,
  matching the project convention. Fortran reference uses 1-based positive/negative.
- Both deps use complex-element strides/offsets (not float64), consistent with
  all complex routines in this project.

## Automation opportunities

- Driver routines like zspsv follow a mechanical pattern: validate, factor, solve.
  A template could generate the entire base.js from the dependency pair.
- The scaffold generator produces files with leading double blank lines that fail
  the stdlib/no-multiple-empty-lines lint rule. Could be fixed in scaffold.py.

## Coverage gaps

- 100% line and branch coverage on base.js. The routine is simple enough that
  all paths (N=0, singular, success) are covered by 7 test cases.
- Lower coverage on transitive deps (zsptrf at 70%, zsptrs at 75%) is expected;
  those paths are covered by their own test suites.

## Complex number handling

- zspsv does no complex arithmetic itself. All complex math is handled by
  zsptrf (Bunch-Kaufman factorization) and zsptrs (triangular solve).
- Symmetric (NOT Hermitian): uses transpose U^T, not conjugate transpose U^H.
  This distinction matters in the deps but not in this driver.
