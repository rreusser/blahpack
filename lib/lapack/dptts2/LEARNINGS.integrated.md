# dptts2: Translation Learnings

## Translation pitfalls

- The N<=1 quick return uses dscal with stride=strideB2 (column stride) to scale across RHS columns. This is because for N=1, B has a single row and we scale all NRHS entries. The Fortran call is `DSCAL(NRHS, 1/D(1), B, LDB)` where LDB is the leading dimension (column stride in col-major).
- No index pitfalls: the forward substitution loop starts at i=1 (0-based) referencing i-1, and backward loop goes from N-2 to 0, both clean in 0-based.

## Dependency interface surprises

- dscal's base.js signature is `(N, da, x, strideX, offsetX)` -- straightforward, no surprises.

## Automation opportunities

- N/A. This is a simple leaf routine with no mechanical patterns that weren't already handled by the scaffold generator.

## Coverage gaps

- 100% line and branch coverage achieved. All paths (N=0, N=1, N>1, single and multiple RHS) are exercised.

## Complex number handling

- N/A. This is a real (double precision) routine only.
