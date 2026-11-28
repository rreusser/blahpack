# dgtts2: Translation Learnings

## Translation pitfalls

- Fortran has two code paths: NRHS<=1 (GOTO-based column loop with unconditional pivot swap via the `I+1-IP+I` address trick) and NRHS>1 (explicit IF on IPIV(I)==I). The JS translation uses only the NRHS>1 pattern for all cases, which is cleaner and produces identical results.
- The Fortran `B(I+1-IP+I, J)` trick computes a row index that is either I (if IP==I+1, i.e. swap happened) or I+1 (if IP==I, no swap). In JS, we use an explicit `if (IPIV[ip] === i)` branch instead, which is more readable.
- For the transpose solve (L^T), the pivot swap direction is reversed: in forward solve, IPIV(I)!=I means swap rows I and I+1 before elimination; in transpose, the same swap is un-done after back-substitution.

## Dependency interface surprises

- N/A. dgtts2 has no LAPACK/BLAS dependencies; it is a self-contained tridiagonal solver.

## Automation opportunities

- N/A. Straightforward translation.

## Coverage gaps

- 100% line and branch coverage achieved.
- Both pivot and no-pivot paths are tested. N=0, N=1, N=2, and N=5 all covered.

## Complex number handling

- N/A. Real-valued routine only.
