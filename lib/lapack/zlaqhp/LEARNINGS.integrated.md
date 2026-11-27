# zlaqhp: Translation Learnings

## Translation pitfalls

- The Fortran EQUED output parameter is a CHARACTER; in JS we return it as a string ('none'/'yes'). This means the JS signature has 10 params instead of the Fortran 11, triggering a signature-conformance lint warning (acceptable, same pattern as dlaqsp).
- Packed storage indexing: jc tracks the start of each column in the packed array. In upper storage, jc increments by j+1; in lower, by N-j. The 0-based JS indexing matches once you account for the Fortran 1-based offset.

## Dependency interface surprises

- No JS dependencies beyond dlamch (for SMALL/LARGE thresholds) and reinterpret-complex128.
- LSAME is replaced by string comparison (uplo === 'upper').

## Automation opportunities

- The Hermitian packed equilibration pattern (zlaqhp) is nearly identical to symmetric packed (dlaqsp/zlaqsp) except for the diagonal forcing. A transform could generate Hermitian variants from symmetric ones by adding the DBLE() / imaginary-zeroing step on diagonals.

## Coverage gaps

- Test 8 (diag_imag_upper) specifically tests that diagonal imaginary parts are zeroed after Hermitian scaling. This is the key difference from the symmetric (zlaqsp) variant.
- All branches covered: upper/lower, equilibrate/no-equilibrate, N=0, N=1, 3x3, 4x4.

## Complex number handling

- AP is Complex128Array; accessed via `reinterpret(AP, 0)` to get a Float64 view where element k has real part at index 2k and imaginary part at 2k+1.
- strideAP is in complex elements, so multiplied by 2 for the Float64 view (sAP = strideAP * 2).
- Off-diagonal elements: both real and imaginary parts scaled by cj * si (real scalar multiplication of complex value).
- Diagonal elements: Fortran uses DBLE(AP(k)) which takes only the real part, then scales by cj^2. The imaginary part is set to 0.0, enforcing Hermitian property (diagonal of Hermitian matrix is real).
