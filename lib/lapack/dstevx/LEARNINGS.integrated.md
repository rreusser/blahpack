# dstevx: Translation Learnings

## Translation pitfalls

- dstebz uses long-form strings ('all'/'value'/'index' for range, 'block'/'entire' for order), not Fortran single-char codes. Initial implementation used 'B'/'E' which caused info=-2 errors.
- dsteqr uses 'initialize'/'update'/'none' for compz, not 'I'/'V'/'N'.
- dlanst uses 'max' for the matrix norm type, not 'M'.
- dstebz returns M via a single-element Int32Array (M[0]), not as a return value. Must allocate `new Int32Array(1)` and read M[0] after the call.
- The dstebz/dstein workspace arrays (IBLOCK, ISPLIT, IWORK) need separate contiguous allocations, not slices of the caller's IWORK array, because stride parameters would complicate offset arithmetic.
- The Fortran GOTO 20 pattern for the rescale section after dsterf/dsteqr success was restructured into an inline block with early return.

## Dependency interface surprises

- dstebz requires separate Int32Array outputs for M and nsplit (both single-element arrays), plus separate IBLOCK, ISPLIT arrays.
- dstein's IFAIL output uses its own contiguous Int32Array; results must be copied back to the caller's IFAIL with proper stride.
- Fortran deps file for dlassq needs `la_xisnan` module dependency added manually (the auto-generated deps file did not include it).

## Automation opportunities

- The long-form string convention for each dependency is a recurring source of bugs. A mapping table or documentation cross-reference would prevent repeated trial-and-error.

## Coverage gaps

- The iscale=1 rescaling path is not covered because the test matrices have norms within RMIN..RMAX. Would need very tiny or very large matrix values to trigger.
- The info>0 path (failed eigenvector convergence) in the sort-and-swap section is not exercised.
- The dsterf/dsteqr failure fallback path (where info!=0 triggers the dstebz path) is not covered.

## Complex number handling

- N/A: dstevx is a real-valued routine.
