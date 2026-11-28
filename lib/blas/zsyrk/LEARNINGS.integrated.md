# zsyrk: Translation Learnings

## Translation pitfalls

- zsyrk vs zherk: the critical difference is NO conjugation and complex (not real) alpha/beta. Every place zherk uses `alpha * ajR` (real scalar), zsyrk needs full complex multiplication `(alphaR*ajR - alphaI*ajI)`. Similarly, beta scaling is complex multiplication, not real scaling.
- The Fortran quick-return condition `((ALPHA.EQ.ZERO).OR.(K.EQ.0)).AND.(BETA.EQ.ONE)` requires checking both real and imaginary parts of alpha and beta against zero/one. The mixed `&&`/`||` operators needed explicit parentheses to satisfy the `no-mixed-operators` lint rule.
- zsyrk diagonal elements stay complex (unlike zherk which forces imaginary part to zero). This simplifies the code since diagonal and off-diagonal elements use the same operations.
- For the `nota` (no-transpose) path, the inner loop computes `temp = alpha * A[j,l]` then accumulates `temp * A[i,l]` -- same as zherk but without the conjugate on A[j,l].
- Fortran test fixture initial C matrix: must carefully map 1-based Fortran column-major indices to 0-based complex element indices in the Complex128Array. Off-by-one in the initial fixture mapping caused a test failure (c(8) maps to C[1,2], not C[0,2]).

## Dependency interface surprises

- N/A -- zsyrk is a leaf routine with no BLAS/LAPACK dependencies beyond reinterpret, real, and imag.

## Automation opportunities

- The Fortran test template for zsyrk is structurally identical to zherk with s/zherk/zsyrk/, s/conjugate-transpose/transpose/, and complex alpha/beta. Could automate generation of z-prefix BLAS level 3 Fortran tests from a template.

## Coverage gaps

- 93.94% branch coverage achieved. The uncovered branches are likely the `betaR === 1 && betaI === 0` short-circuit in the main computation paths (where beta=1 is identity and we skip scaling). All major code paths (upper/lower x transpose/no-transpose x alpha-zero/nonzero x beta-zero/nonzero/one) are covered.

## Complex number handling

- All complex arithmetic is inlined (addition, subtraction, multiplication, real/imaginary scalar scaling). No complex division or absolute value needed, so no calls to cmplx helpers.
- Used `real()` and `imag()` from `@stdlib/complex/float64/real` and `@stdlib/complex/float64/imag` to extract scalar components at function entry, then worked entirely with Float64 views.
