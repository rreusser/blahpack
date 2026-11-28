# dsytrf: Translation Learnings

## Translation pitfalls

- **IPIV offset for lower case**: When dsytrf calls dsytf2/dlasyf on a submatrix starting at column k, the returned IPIV values are relative to the submatrix. For 1x1 pivots (positive IPIV), must add k. For 2x2 pivots (negative IPIV encoded as ~kp_local), must decode, add k, and re-encode: `~(~ipiv + k)`.
- **INFO offset for lower case**: When the submatrix factorization returns iinfo > 0, the global info is `iinfo + k` (adding the column offset).
- **Workspace allocation**: Removed Fortran's LWORK/ILAENV workspace query. Instead, allocate W internally in each dlasyf call. This is slightly less efficient but simpler.
- **NB hardcoded to 32**: Matches typical ILAENV return value. Fortran's dynamic NB selection is replaced with a constant.

## Dependency interface surprises

- dlasyf returns `{ info, kb }` object instead of using output parameters. The `kb` field is critical for advancing the loop variable.
- dsytf2 returns a plain integer (info). The loop convention differs: for upper case, dsytf2 processes all remaining k columns; for lower, it processes N-k columns.

## Automation opportunities

- N/A.

## Coverage gaps

- The blocked+unblocked transition (single factorization spanning both dlasyf and dsytf2) is tested via the 40x40 matrices.
- The info propagation from dsytf2 is not separately tested from dsytrf (the singular test uses N=2 which goes through unblocked path only).
- 98.62% line coverage, 95.24% branch coverage.

## Complex number handling

- N/A: dsytrf is a real-valued routine.
