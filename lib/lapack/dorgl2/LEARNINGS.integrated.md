# dorgl2: Translation Learnings

## Translation pitfalls

- dorgl2 is a straightforward real-valued analog of zungl2. No zlacgv calls needed (those only exist for the complex conjugation in the unitary case).
- The reflector vector v is stored as row i of A, so the stride for v passed to dlarf is strideA2 (column stride), not strideA1.
- dscal scales row i from column i+1 onward with stride strideA2 (stepping along columns in the same row).
- Fortran `DLARF('Right', M-I, N-I+1, ...)` becomes `dlarf('R', M-i-1, N-i, ...)` in 0-based JS because M-I maps to M-(i+1) = M-i-1 and N-I+1 maps to N-(i+1)+1 = N-i.

## Dependency interface surprises

- dlarf for real takes tau as a plain scalar number, not as an array+offset (unlike zlarf which takes Complex128Array+offset). This simplifies the calling convention compared to zungl2.
- dscal takes alpha as a plain scalar.

## Automation opportunities

- The translation from zungl2 to dorgl2 was largely mechanical: remove reinterpret/Complex128Array, remove zlacgv calls, simplify tau from array indexing to plain scalar, remove imaginary-part handling. Could be semi-automated for other z-prefix to d-prefix translations.

## Coverage gaps

- 100% line and 100% branch coverage achieved. All code paths exercised:
  - M <= 0 quick return (m0_quick test)
  - K < M initialization of identity rows (k0_identity, 2x5_k1, 3x4_k2 tests)
  - K = M full generation (3x4_k3, 3x3_k3, 2x5_k2 tests)
  - i < N-1 and i < M-1 branching (various M/N/K combinations)
  - 1x1 edge case (1x1_k1 test)
  - Single-row case where i == N-1 (1x1_k1 test)

## Complex number handling

- N/A - dorgl2 is a real-valued routine. No complex arithmetic needed.
