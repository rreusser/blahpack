# dsygvx: Translation Learnings

## Translation pitfalls

- dsygvx is a thin driver that delegates to dpotrf, dsygst, dsyevx, dtrsm, dtrmm. The main complexity is getting the backtransform correct: ITYPE=1,2 use dtrsm while ITYPE=3 uses dtrmm. The TRANS parameter depends on both ITYPE and UPLO.
- When dsyevx returns INFO > 0 (partial convergence), M must be set to INFO-1 for the backtransform -- not the M from out.M.
- The dpotrf failure INFO must be offset by N: `return N + info`.

## Dependency interface surprises

- dsyevx uses `out.M` (object output) rather than a return value for M. This propagates into dsygvx which also uses `out.M`.
- dpotrf uses short-form uplo internally but accepts long-form strings ('upper'/'lower').
- dtrsm/dtrmm accept long-form strings for side, uplo, trans, diag.

## Automation opportunities

- N/A. This is a simple composition of existing routines with no mechanical transforms needed.

## Coverage gaps

- Lines 118-119 (the `info > 0` branch from dsyevx partial convergence) are not covered because our test matrices all converge. This path requires a matrix that causes dsyevx's inverse iteration to fail for some eigenvectors -- difficult to construct on purpose.
- 98.67% line coverage, 93.33% branch coverage achieved.

## Complex number handling

- N/A: dsygvx is a real-valued routine.
