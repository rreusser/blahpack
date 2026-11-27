# dspcon: Translation Learnings

## Translation pitfalls

- Packed storage diagonal traversal requires careful indexing. Upper packed:
  diagonal of row i (0-based) is at `N*(N+1)/2 - 1` for the last row, stepping
  back by `(i+1)` for each preceding row. Lower packed: diagonal starts at 0,
  stepping forward by `(N - i)`.
- The Fortran uses 1-based `IP` pointer that walks through packed diagonal
  positions. The JS translation uses 0-based `ip` with the same step sizes.

## Dependency interface surprises

- dlacn2 reverse-communication pattern: KASE, EST, ISAVE are all array-wrapped
  scalars (Int32Array/Float64Array) to allow mutation across calls.
- dsptrs B parameter needs strideB1=sw (row stride) and strideB2=N*sw (column
  stride) even though NRHS=1, because its signature expects a 2D layout.

## Automation opportunities

- The dspcon/dsycon pattern is nearly identical; only the diagonal-singularity
  check and the solver call differ. A template could generate both.

## Coverage gaps

- All branches covered (100% line, branch, and function coverage).
- Singular matrix detection tested for both upper and lower packed storage.

## Complex number handling

- N/A: dspcon is a real-valued routine.
