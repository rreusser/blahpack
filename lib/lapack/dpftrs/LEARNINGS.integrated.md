# dpftrs: Translation Learnings

## Translation pitfalls

- Simple delegation routine: dpftrs just calls dtfsm twice (forward and back substitution), so there are no index arithmetic pitfalls.
- The key mapping is: UPLO='L' means the factorization is A = L*L^T, so first solve L*Y=B with trans='no-transpose', then L^T*X=Y with trans='transpose'. For UPLO='U', the order is reversed (U^T*Y=B first, then U*X=Y).
- The Fortran SIDE='L', DIAG='N' arguments are always the same for both calls.

## Dependency interface surprises

- dtfsm takes (transr, side, uplo, trans, diag, M, N, alpha, A, strideA, offsetA, B, strideB1, strideB2, offsetB) -- the TRANSR parameter is passed through directly from dpftrs to dtfsm.
- No return value from dtfsm (void), unlike dpftrs which returns an integer status code.

## Automation opportunities

- The Fortran deps file needs manual addition of DTRTTF and DPFTRF for compilation of the Fortran test, since the test itself calls those routines to set up the input.

## Coverage gaps

- All 8 TRANSR/UPLO combinations for both odd (N=3) and even (N=4) tested.
- Multiple RHS (NRHS=2,3) tested.
- Edge cases N=0, NRHS=0, N=1 tested.
- Larger N=5 tested.

## Complex number handling

- N/A: dpftrs is a real-valued routine.
