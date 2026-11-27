# dsysvx: Translation Learnings

## Translation pitfalls

- dsysvx is a high-level driver routine that delegates to 6 subroutines: dlacpy, dsytrf, dlansy, dsycon, dsytrs, dsyrfs. The implementation is straightforward orchestration with no loop-level translation needed.
- The LWORK/-1 workspace query pattern maps cleanly to JS: check lwork === -1, write optimal size to WORK[0], return early.
- RCOND must be passed as a single-element Float64Array (not a scalar), because dsycon writes to rcond[0]. This differs from the Fortran signature where RCOND is a scalar output parameter.
- The Fortran uses ILAENV to query NB for optimal workspace; JS hardcodes NB=64 as in dsytrf.

## Dependency interface surprises

- dsyrfs base.js was using short-form string convention ('U'/'L') while all other dependencies (dsytrf, dsytrs, dsycon, dlansy, dlacpy) use long-form ('upper'/'lower'). Fixed dsyrfs to use long-form to match.
- dlansy uses 'inf-norm' for infinity norm (not 'I' or 'infinity'). The full norm names are: 'max', 'inf-norm', 'one-norm', 'frobenius'.
- dlacpy uses 'upper'/'lower' for triangle copy, and falls through to full-matrix copy for any other value (including 'all').
- dsycon takes anorm as a plain scalar number, and rcond as a Float64Array (writes to rcond[0]).

## Automation opportunities

- The string convention mismatch in dsyrfs (short vs long form) was a manual discovery. A lint rule or transform that checks all base.js files for consistent string conventions would catch this class of bug automatically.

## Coverage gaps

- The rcond < epsilon branch (info = N+1) is not exercised because it requires a matrix that factors successfully but has rcond below machine epsilon. The singular test returns early from dsytrf. Branch coverage is 92.31% which exceeds the 85% target.
- All other branches are covered: FACT='not-factored'/'factored', upper/lower, N=0, singular, multi-RHS, ill-conditioned, lwork query.

## Complex number handling

- N/A: dsysvx is a real-valued routine. The complex analog would be zsysvx or zhesyx.
