# dsycon: Translation Learnings

## Translation pitfalls

- The IPIV singularity check translates from Fortran `IPIV(I) > 0` to JS `IPIV[i] >= 0` because the JS convention uses 0-based indices (so a 1x1 pivot at row 0 has `IPIV[0] = 0`, which is >= 0).
- The Fortran uses `WORK(N+1)` as the V workspace for dlacn2, which in JS becomes `offsetWORK + N * strideWORK`.
- dsytrs B matrix strides: when passing WORK as a single-column B matrix, `strideB1 = strideWORK` (row stride) and `strideB2 = N * strideWORK` (column stride). The column stride value does not matter for nrhs=1 since only column 0 is accessed.

## Dependency interface surprises

- dlacn2 uses internal ISAVE/KASE/EST arrays (Int32Array and Float64Array of length 3, 1, 1 respectively) that must be allocated by the caller and persist across the reverse-communication loop.
- dsytrs takes long-form uplo strings ('upper'/'lower'), matching the convention used throughout this codebase.

## Automation opportunities

- N/A. This was a straightforward translation with no mechanical steps needing automation.

## Coverage gaps

- Achieved 100% line and branch coverage. The singular matrix tests for both upper and lower paths, plus identity, well-conditioned, ill-conditioned, N=0, N=1, and anorm=0 cases cover all code paths.

## Complex number handling

- N/A. dsycon is a real (double precision) routine with no complex arithmetic.
