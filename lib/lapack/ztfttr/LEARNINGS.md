# ztfttr: Translation Learnings

## Translation pitfalls

- Fortran test had LDA mismatch: A was declared as A(NMAX, NMAX) with NMAX=8, but ztfttr was called with LDA=N=5. The routine writes with stride LDA, but the packing code reads with stride NMAX. Fixed by passing LDA=NMAX to ztfttr in the Fortran test and extracting the N-by-N submatrix into a contiguous packed array.
- The d-prefix counterpart dtfttr uses 'no-transpose'/'transpose' for TRANSR, but ztfttr uses 'no-transpose'/'conjugate-transpose' (matching Fortran 'N'/'C'). This is a key difference for complex routines.
- DCONJG in copy operations maps to sign-flipping the imaginary part only: `Av[p+1] = -Fv[da+1]`. Direct copies need both real and imaginary parts transferred.

## Dependency interface surprises

- N/A. ztfttr has no BLAS/LAPACK dependencies -- it is purely index manipulation and element copying.

## Automation opportunities

- The Fortran test pattern for complex 2D arrays (declare, equivalence, pack, print) is highly repetitive. A helper subroutine `print_complex_matrix` that takes a complex array, LDA, M, N and handles packing+printing would reduce test boilerplate.

## Coverage gaps

- N/A. Achieved 100% line, branch, and function coverage with N=5 (odd) and N=6 (even) tests across all four transr x uplo combinations, plus edge cases N=0 and N=1.

## Complex number handling

- No complex arithmetic required (no multiplication, division, etc.). Only operations are: (1) direct copy of both real/imaginary parts, and (2) conjugation via imaginary part negation. No need for cmplx.js helpers.
- Used standard reinterpret pattern: Complex128Array API at boundary, Float64Array views internally with strides/offsets multiplied by 2.
