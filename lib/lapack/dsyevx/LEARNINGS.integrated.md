# dsyevx: Translation Learnings

## Translation pitfalls

- Direct mirror of zheevx (complex version). Real arithmetic is simpler: no reinterpret(), no separate RWORK, single-element strides.
- dsteqr expects 'update' (not 'compute-vectors') when the Z matrix has been pre-initialized with the orthogonal transformation Q. The Fortran passes JOBZ='V' to dsteqr, but the JS dsteqr uses 'none'/'update'/'initialize' strings.
- M (number of found eigenvalues) is an output parameter. Following zheevx convention, it is returned via `out.M` rather than as a parameter.
- dsytrd in JS does not take WORK/LWORK parameters; it allocates workspace internally. The WORK array passed to dsyevx is still partitioned for TAU/D/E/scratch workspace that dsytrd writes to.

## Dependency interface surprises

- dstebz uses 'all'/'value'/'index' for range and 'block'/'entire' for order (long-form strings matching the conventions).
- dormtr uses long-form strings ('left', 'upper', 'no-transpose') — consistent with dormql/dormqr.
- dlansy uses 'max' (not 'M') for max-norm.
- dlacpy uses 'all' (not 'A') for full-matrix copy.

## Automation opportunities

- The workspace partitioning pattern (INDTAU, INDE, INDD, INDWRK mapped from 1-based Fortran offsets to 0-based JS) is mechanical and repeated in every driver routine. Could potentially be automated.

## Coverage gaps

- Scaling paths (iscale=1) are tested for both tiny and large matrices — 94% line coverage achieved.
- `abstol > 0` combined with scaling is untested (line 228-229) — a minor branch.
- dsteqr/dsterf failure fallthrough (lines 279-282) is not tested — requires a matrix that defeats QR iteration convergence, which is extremely difficult to construct.
- Sorting with info!=0 (lines 345-374) is not tested — requires dstein to fail convergence on some eigenvectors.

## Complex number handling

- N/A: dsyevx is a real-valued routine.
