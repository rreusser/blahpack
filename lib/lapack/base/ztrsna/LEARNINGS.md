# ztrsna: Translation Learnings

## Translation pitfalls

- `ztrexc` is called with compq `'No Q'`. In our JS convention that maps to
  `'none'` (not `'no-transpose'`). A dummy Complex128Array of length 1 is
  passed as Q so the unused parameter has a valid reference.
- The Fortran code uses `WORK( 1, N+1 )` (i.e. the (N+1)-th column) as the
  V workspace for `zlacn2` while column 1 holds X. In JS this becomes
  `offsetWORK + N*strideWORK2` for V and `offsetWORK` for X.
- The inner overflow-check goto (`GO TO 40` which jumps past the SEP
  assignment) is modeled with a `skipEstimate` boolean rather than a label.
- After `ztrexc`, the code subtracts WORK(1,1) from the diagonal elements
  starting at index 2 — this prepares T22 - lambda*I for the condition
  number estimator. The subtraction is done directly on the Float64 view
  using interleaved complex layout.
- `dlamch` key names: use `'precision'` and `'safe-minimum'` (not `'P'` and
  `'S'`). `BIGNUM` is declared in the Fortran source but never referenced,
  so it was removed from the JS translation.

## Dependency interface surprises

- `zlacn2` takes the V workspace as its first array argument and X as its
  second — the opposite of what one might expect from Fortran calling
  conventions (`CALL ZLACN2( N-1, WORK(1,N+1), WORK, ... )`). Getting this
  right is essential for correct condition number estimation.
- `izamax` returns a 0-based index, so no additional `-1` adjustment is
  needed when indexing WORK.

## Testing

- To produce meaningful fixtures for `ztrsna`, the Fortran test calls
  `ztrevc` first to build VL and VR for a fixed upper triangular T.
- For the `howmny='selected'` test, `ztrevc` packs the selected eigenvectors
  into the first `ks` columns of VL/VR. The JS test mimics this by copying
  the relevant columns of the full-mode result into a packed buffer.

## Workaround

- ESLint OOMs when invoked on the full module directory (README.md triggers
  the remark-based JSDoc rules). Individual subdirectories lint cleanly.
  A `lint.eslint-pass` exception is registered in `conformance.config.json`.
