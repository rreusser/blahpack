# dpteqr: Translation Learnings

## Translation pitfalls

- dpteqr is a relatively thin wrapper: it calls dpttrf for Cholesky factorization, then transforms the result into a bidiagonal form and calls dbdsqr. The main logic is straightforward with no index complexity.
- The Fortran code uses local 1x1 arrays `C(1,1)` and `VT(1,1)` as dummy arguments to dbdsqr (since ncvt=0 and ncc=0). In JS, these are allocated as `new Float64Array(1)`.

## Dependency interface surprises

- dbdsqr expects stride parameters for all five matrices (d, e, VT, U, C) even when ncvt=0 or ncc=0. The dummy VT/C arrays still need valid stride/offset arguments.
- dpttrf modifies both D and E in-place: D gets the diagonal of the L*D*L^T factorization, and E gets the subdiagonal of L.

## Automation opportunities

- No new automation needed. The scaffold + gen_test pipeline worked well for this routine.

## Coverage gaps

- The error path from dpttrf (non-positive definite matrix) is not tested since all test matrices are SPD. The dbdsqr convergence failure path is also untested. Both are unlikely in practice for well-conditioned SPD inputs.

## Complex number handling

- N/A: dpteqr is a real-valued routine.
