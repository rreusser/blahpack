# dsytf2: Translation Learnings

## Translation pitfalls

- **IDAMAX row scan count off-by-one in upper case**: The Fortran `IDAMAX(K-IMAX, A(IMAX,IMAX+1), LDA)` passes K-IMAX elements (1-based). In 0-based JS, this is k-imax elements (NOT k-imax-1). The number of columns from imax+1 to k inclusive is k-imax. Getting this wrong causes the 2x2 pivot detection to fail for the upper triangle case.
- **IPIV encoding for 2x2 pivots**: Used bitwise NOT `~kp` to encode 0-based 2x2 pivot indices. This maps kp=0 to -1, kp=1 to -2, etc. Conveniently, this matches Fortran's negative encoding when Fortran uses 1-based indices: Fortran `-KP_1based = -(kp+1) = ~kp`.
- **NaN check**: Fortran `DISNAN(ABSAKK)` becomes `absakk !== absakk` in JS.
- **INFO is 1-based**: When a zero pivot is found at 0-based index k, info = k+1 (matching Fortran convention).

## Dependency interface surprises

- idamax returns 0-based index, which requires careful mapping when converting Fortran's 1-based JMAX = IMAX + IDAMAX(K-IMAX,...) pattern.
- dsyr, dscal, dswap all work with stride/offset pattern as expected.

## Automation opportunities

- N/A for this routine.

## Coverage gaps

- The NaN branch (line 98/210, `absakk !== absakk`) is not tested. Would require a matrix with NaN values.
- The k=0 edge in the upper case and k=N-1 edge in the lower case (single-element column) are implicitly tested through larger matrices but not as isolated tests.

## Complex number handling

- N/A: dsytf2 is a real-valued routine.
