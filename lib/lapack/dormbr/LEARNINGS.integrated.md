# dormbr: Translation Learnings

## Translation pitfalls

- dormbr is a thin dispatcher: it delegates entirely to dormqr or dormlq depending on VECT='Q' or 'P'. The main subtlety is the offset arithmetic in the NQ < K (for Q) and NQ <= K (for P) branches:
  - VECT='Q', NQ < K: reflectors start at row 1 (0-based) of A, so offset A by strideA1. The C submatrix also shifts by one row (SIDE='L') or one column (SIDE='R').
  - VECT='P', NQ <= K: reflectors start at column 1 (0-based) of A, so offset A by strideA2. Same C submatrix shift pattern.
- The Fortran comparison for P uses `NQ > K` (not `NQ >= K` like Q does). This is correct because for P the reflectors are rows of A, and when NQ = K, the first reflector is in row 0 starting at column 1.
- The TRANS swap for VECT='P': Fortran uses 'T' (transpose) where zunmbr uses 'C' (conjugate transpose). This is the only difference from the complex version.

## Dependency interface surprises

- dormqr and dormlq have identical signatures: (side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork).
- No surprises. The pattern matches zunmbr -> zunmqr/zunmlq exactly.

## Automation opportunities

- The Fortran test for dormbr requires dgebrd and all its dependencies in the deps file. This is not auto-detected by `init_routine.py` since dormbr's own LAPACK source only calls dormqr/dormlq. The deps file had to be manually extended with dgebrd's dependencies.

## Coverage gaps

- 100% line, branch, and function coverage achieved on base.js with 21 tests.
- All 8 combinations of VECT x SIDE x TRANS are tested for both upper bidiagonal (M>N) and lower bidiagonal (M<N) cases.
- Both NQ >= K and NQ < K branches are exercised.
- Edge cases M=0, N=0, K=0 are covered.
- Non-identity C matrices tested for both VECT='Q' and VECT='P'.

## Complex number handling

- N/A: dormbr is a real (double precision) routine. No complex arithmetic involved.
