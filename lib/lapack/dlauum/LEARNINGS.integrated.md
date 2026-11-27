# dlauum: Translation Learnings

## Translation pitfalls

- The Fortran loop `DO I = 1, N, NB` with 1-based indexing translates directly to `for (i = 0; i < N; i += NB)` with 0-based. The block size `IB = MIN(NB, N-I+1)` in Fortran becomes `ib = Math.min(NB, N - i)` in 0-based JS (no +1 needed).
- Fortran's `A(I, I)` submatrix offset becomes `offsetA + i * sa1 + i * sa2` in JS.
- The condition `IF( I+IB.LE.N )` in 1-based Fortran becomes `if ( i + ib < N )` in 0-based JS.
- The remaining-columns count `N-I-IB+1` in Fortran becomes `N - i - ib` in JS (no +1).

## Dependency interface surprises

- dtrmm, dgemm, dsyrk all use the same stride/offset pattern: `(A, strideA1, strideA2, offsetA)`. No surprises here.
- dlauu2 follows the same signature as dlauum (uplo, N, A, strideA1, strideA2, offsetA) and returns info. Clean interface.

## Automation opportunities

- The Fortran deps file generator (`bin/deps.py`) does not include `ilaenv` and its transitive deps (`ieeeck`, `iparmq`). These must be added manually to `deps_*.txt` for any blocked algorithm. This is a recurring pattern for all blocked routines.

## Coverage gaps

- 100% line and branch coverage achieved on base.js.
- Both UPLO='U' and UPLO='L' paths tested.
- Both unblocked (N <= NB) and blocked (N > NB) paths tested with NB=32.
- Edge cases N=0 and N=1 covered.

## Complex number handling

- N/A: dlauum is a real (double precision) routine. No complex arithmetic involved.
