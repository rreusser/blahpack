# dpbstf: Translation Learnings

## Translation pitfalls

- The key difference from dpbtf2 is the "split" factorization: the matrix is split at `m = floor((N+kd)/2)`. The backward loop processes columns N down to m+1, and the forward loop processes columns 1 to m. In 0-based indexing, this translates to `j = N-1` down to `m`, and `j = 0` to `m-1`.
- In the backward (upper) loop, dscal uses stride `sa1` (within-column steps) and dsyr also uses `sa1` for the x-vector stride. This differs from the forward loop where dscal/dsyr use `kld` as stride for the diagonal-stepping pattern.
- In the backward (lower) loop, dscal/dsyr use stride `kld` (diagonal stepping). The forward loop uses stride `sa1` (within-column).
- The `km` computation differs between backward and forward loops: backward uses `min(j, kd)` (Fortran: `min(J-1, KD)` with 1-based J), forward uses `min(kd, m-j-1)` (Fortran: `min(KD, M-J)`).

## Dependency interface surprises

- dsyr is called with the band matrix as both the x-vector source array and the symmetric matrix to update (aliased arrays). This works correctly because dsyr reads x fully before updating A.

## Automation opportunities

- No new automation opportunities identified. The scaffold + fixture pipeline worked well.

## Coverage gaps

- The `not_posdef` test only covers the case where non-positive-definiteness is detected in the forward loop (j=1 returns INFO=1). A test for failure in the backward loop would require a matrix whose trailing block is not positive definite but whose leading block would be, which is unusual for band matrices. The `not_posdef upper` test covers a 2x2 failure case.

## Complex number handling

- N/A: dpbstf is a real-valued routine.
