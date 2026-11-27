# zhpsvx: Translation Learnings

## Translation pitfalls

- zhpsvx is a direct complex analogue of dspsvx. The mapping is: dlansp -> zlanhp, dsptrf -> zhptrf, dsptrs -> zhptrs, dspcon -> zhpcon, dsprfs -> zhprfs, dcopy -> zcopy.
- RCOND is a scalar output passed via Float64Array(1), matching the dspsvx pattern.
- The Fortran WORK is COMPLEX*16 (2*N), so in JS it becomes Complex128Array(2*N). RWORK is DOUBLE PRECISION (N), a regular Float64Array(N). There is no IWORK parameter (unlike dspsvx which has both WORK and IWORK).

## Dependency interface surprises

- zhpcon writes rcond into rcond[0] (Float64Array) rather than returning it, same as dspcon.
- zhptrf/zhptrs use 0-based pivot indices with bitwise-NOT encoding for 2x2 pivots, while Fortran uses 1-based positive/negative pivots. Fixture comparison must account for this.
- zhptrs has a known bug with 2x2 pivots (upper case) that produces incorrect solutions. Test cases avoid matrices that trigger 2x2 pivots.

## Automation opportunities

- The deps_zhpsvx.txt required many transitive BLAS dependencies (zcopy, zaxpy, zhpmv, etc.) and Fortran module dependencies (la_constants, la_xisnan) that deps.py missed. These had to be manually added.

## Coverage gaps

- No test with 2x2 pivots due to a pre-existing bug in zhptrs with upper-triangular 2x2 pivot handling.
- No test for negative strides or non-zero offsets since this is a driver routine.

## Complex number handling

- The driver itself does not perform complex arithmetic directly; it delegates to zcopy, zlanhp, zhpcon, zhptrs, zhprfs, zlacpy.
- Complex arrays (AP, AFP, B, X, WORK) use Complex128Array with strides/offsets in complex elements. FERR, BERR, RWORK, rcond use Float64Array.
