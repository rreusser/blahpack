# dgetrs: Translation Learnings

## Translation pitfalls

- dgetrs does not modify A or IPIV, only B. The Fortran test reuses the factored A across multiple solve calls (e.g., 'N' solve followed by 'T' solve). In JS tests, each test case must independently factorize because test cases are isolated.
- Fixture-based testing is unreliable for dgetrs because the JS dgetrf produces 0-based IPIV while Fortran produces 1-based IPIV. The factorizations are mathematically equivalent but have different pivot orderings. Tests must verify mathematical correctness (A*x = b or A^T*x = b) using the original unfactored A, rather than comparing solution vectors against Fortran fixtures.
- The lowercase trans argument ('n', 't') works correctly because base.js checks both cases explicitly.

## Dependency interface surprises

- dlaswp reverse mode (incx=-1) was broken before this test effort. The bug caused incorrect transpose solves (A^T*x = b). The fix required rewriting dlaswp to correctly compute the IPIV starting offset and iteration direction for reverse pivot application.
- dgetrs delegates to dtrsm for both forward and back substitution. The dtrsm calls must specify the correct side ('L'), uplo ('L' or 'U'), trans ('N' or 'T'), and diag ('U' for unit-diagonal L, 'N' for non-unit U) parameters.

## Automation opportunities

- N/A. The test structure is straightforward: factorize with dgetrf, solve with dgetrs, verify A*x = b.

## Coverage gaps

- base.js achieves 100% line and branch coverage. No gaps.

## Complex number handling

- N/A. dgetrs operates on real (double precision) matrices only.
