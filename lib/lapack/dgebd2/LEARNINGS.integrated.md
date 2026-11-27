# dgebd2: Translation Learnings

## Translation pitfalls

- Straightforward real-valued translation from Fortran. No complex conjugation
  needed (unlike zgebd2 which requires zlacgv and conj(tau) handling).
- The `Math.min(i+1, M-1)` guard in dlarfg calls prevents out-of-bounds access
  when i is the last index; mirrors Fortran's `MIN(I+1, M)`.
- For 1x3 and 3x1 edge cases, the strideA2 must match the number of rows (M),
  not be arbitrarily set. E.g., for a 1x3 matrix strideA2=1 (since M=1).

## Dependency interface surprises

- `dlarfg`: alpha is `(array, offset)` pair, not a scalar. This is documented
  in dependency-conventions.md but easy to forget. The routine modifies alpha
  in-place (writes beta back to the same location).
- `dlarf`: tau is a plain scalar number (not an array+offset like zlarf's complex
  tau). Must read `TAUQ[offset]` before calling, not pass the array.
- No new surprises beyond what is already documented.

## Automation opportunities

- N/A. The translation was direct from the Fortran reference, following the
  existing zgebd2 pattern. No mechanical steps were repeated.

## Coverage gaps

- 100% line and branch coverage achieved. All paths covered:
  - M >= N (upper bidiagonal): 4x3, 3x3, 3x1, 1x1
  - M < N (lower bidiagonal): 3x4, 1x3
  - Quick return: M=0, N=0
  - TAUP=0 branch (N=1 in M>=N path) and TAUQ=0 branch (M=1 in M<N path)

## Complex number handling

- N/A. dgebd2 is a real-valued routine (double precision only). No complex
  arithmetic involved. The complex analog is zgebd2.
