# dlasd2: Translation Learnings

## Translation pitfalls

- The routine uses deeply nested permutation chains (IDXQ, IDX, IDXP, IDXC) with 1-based values. Keeping 1-based internal indexing was essential to avoid off-by-one errors in expressions like `IDXQ[IDX[JPREV]+1]`.
- K is an OUTPUT parameter (not an input despite the signature generator placing it as a regular param). Must be passed as `Int32Array(1)` and written via `K[0] = kk`.
- COLTYP always writes 4 entries on exit (CTOT[1..4]), even when N < 4. Callers must dimension COLTYP to at least `max(N, 4)`.
- The "all deflated" path (J=N in the first scan) jumps directly to label 120, skipping the "record last value" at label 110. Initially I incorrectly recorded an extra value in this path.
- dlamrg outputs 1-based INDEX values. The expression `IDX(JPREV)+1` adds 1 to a 1-based value, so the JS index becomes `IDX[...] * stride` (the +1-1 cancels).

## Dependency interface surprises

- dlamrg: INDEX output values are 1-based (Fortran convention), documented in its JSDoc. This is consistent across the codebase but must be remembered when chaining permutations.
- dlaset: uses `'full'` (not `'all'` or `'A'`) for the type parameter. Already handled by scaffold.

## Automation opportunities

- The "pack 2D matrix for printing" pattern in Fortran tests (copy N-by-N submatrix from NMAX-by-NMAX into contiguous array) could be factored into a test_utils subroutine to reduce test boilerplate.

## Coverage gaps

- `DSIGMA(2) <= hlftol` replacement (line 339): requires the second non-deflated singular value to be near-zero, which is hard to construct because near-zero values typically get deflated first via the small-Z path.
- `z(1) <= tol` when M > N (line 344): requires both Z1 and Z(M) to combine to a very small value.
- `idxj <= nlp1` decrement in the Givens rotation path (line 280): requires the close-values deflation to fire on entries from the upper block, which depends on specific permutation orderings.
- All three are acceptable edge cases (below 3% of total lines).

## Complex number handling

- N/A: dlasd2 is a real-valued routine.
