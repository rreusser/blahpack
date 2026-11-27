# dgttrf: Translation Learnings

## Translation pitfalls

- IPIV is 0-based in JS (Fortran is 1-based). When a row swap occurs, the Fortran code stores `IPIV(I) = I+1` (1-based), but in JS we store `IPIV[ip] = i + 1` (0-based index of the swapped row). Fixture comparison requires subtracting 1 from Fortran IPIV values.
- The last row pair (i = N-2 in 0-based) is handled separately from the main loop because it does not touch DU2 or DU(i+1). Easy to miss this structural difference when translating the loop.
- The singular matrix detection loop returns 1-based INFO (matching Fortran convention), so `return i + 1` from a 0-based loop.
- Incremental pointer pattern works cleanly for all five arrays since they are all 1D with independent strides.

## Dependency interface surprises

- N/A. This is a leaf routine with no external dependencies (no BLAS or LAPACK calls).

## Automation opportunities

- N/A. Straightforward translation with no mechanical patterns that were not already handled by existing tooling.

## Coverage gaps

- 100% line, branch, and function coverage achieved. The test suite covers: no-pivot path (diagonally dominant), pivot path (|dl| > |d|), singular matrix (INFO > 0), N=0/1/2 edge cases, negative N, and stride/offset parameters.

## Complex number handling

- N/A. Real-valued routine only (d-prefix).
