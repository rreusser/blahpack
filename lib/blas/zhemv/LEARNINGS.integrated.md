# zhemv: Translation Learnings

## Translation pitfalls

- Hermitian diagonal elements must be treated as real: use only `Av[ai]` (real part), ignore `Av[ai+1]`. The Fortran uses `DBLE(A(J,J))` which extracts only the real part.
- The conjugate-transpose accumulation `temp2 += conj(A[i,j]) * x[i]` requires careful sign handling: `conj(a+bi) = a-bi`, so the products become `aR*xR + aI*xI` (real) and `aR*xI - aI*xR` (imag) — note the `+aI*xI` in the real part vs the usual `-aI*xI` for non-conjugated multiply.
- When constructing JS test data from Fortran test data, carefully track which Fortran array indices map to which matrix positions. With LDA=N and column-major layout, A(k) maps to row `(k-1)%LDA`, col `floor((k-1)/LDA)`.
- The Fortran test 9 (complex_alpha_beta) used A(4)=(1,1) and A(5)=(3,0) with LDA=2, N=2. A(5) is outside the matrix — only A(1..4) matter. Initially misinterpreted A(4) as the off-diagonal instead of diagonal, causing a test failure.

## Dependency interface surprises

- N/A — zhemv has no BLAS/LAPACK dependencies beyond LSAME and XERBLA (which are replaced by JS conditionals).

## Automation opportunities

- The pattern of translating Fortran array initialization to Complex128Array constructors is mechanical. A tool that reads the Fortran `A(k) = (re, im)` assignments and outputs the interleaved JS array literal would save time.
- The Fortran LDA-based storage layout to JS stride-based conversion is a common source of test bugs. Could automate fixture-to-JS-test generation that handles this mapping.

## Coverage gaps

- No gaps: 100% line, 100% branch, 100% function coverage achieved.
- All paths covered: N=0, alpha=0+beta=1, alpha=0+beta!=1, beta=0, non-trivial beta, upper triangle, lower triangle, unit stride, non-unit stride, complex alpha/beta.

## Complex number handling

- All complex arithmetic inlined (addition, subtraction, multiplication, conjugation, real-scalar scaling). No cmplx.div or cmplx.abs needed.
- The diagonal of a Hermitian matrix is real, so diagonal multiplication reduces to real*complex (two multiplies instead of four).
- Conjugation for the `temp2` accumulation is done by flipping signs in the multiply rather than explicitly conjugating array values.
- Followed the zgemv pattern: reinterpret Complex128Array to Float64Array, multiply strides/offsets by 2, operate on interleaved re/im pairs.
