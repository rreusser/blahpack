# dgbequ: Translation Learnings

## Translation pitfalls

- Straightforward adaptation of zgbequ. Main difference: uses `Math.abs()` instead of `cabs1()` for element magnitudes since this is the real-valued variant.
- No complex reinterpret needed; AB is a plain Float64Array accessed directly.
- The `rowcnd`, `colcnd`, and `amax` Fortran output scalars are returned in a result object (same pattern as zgbequ), not passed as parameters. This triggers a benign lint warning about signature conformance (14 vs 17 params).

## Dependency interface surprises

- Only dependency is `dlamch('safe-minimum')` for SMLNUM/BIGNUM bounds, precomputed at module load time (same as zgbequ).

## Automation opportunities

- Real-valued `*gbequ` routines (dgbequ, sgbequ) are nearly identical to zgbequ minus complex handling. A template could generate them.

## Coverage gaps

- Non-square matrix with zero columns beyond the band (nonsquare test, column 4) exercises the zero-column early return path (`info = M + j + 1`).
- All major code paths covered: quick returns (M=0, N=0), zero row, zero column, normal scaling, diagonal-only, non-square.

## Complex number handling

- N/A: dgbequ is a real-valued routine.
