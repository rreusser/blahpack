# dstein: Translation Learnings

## Translation pitfalls

- ISPLIT values are 1-based in Fortran (end indices of blocks). JS code must subtract 1 for 0-based end index but keep the ISPLIT values as-is for block boundary logic.
- IBLOCK values are 1-based block indices. The outer loop goes from 1 to IBLOCK(M), matching Fortran convention.
- idamax returns 0-based index in JS vs 1-based in Fortran. All WORK array indexing using jmax must account for this.
- The WORK array is carved into 5 segments of N elements each (indrv1..indrv5). The Fortran uses 1-based pointer offsets; JS uses direct byte offsets.
- IFAIL stores 1-based eigenvector indices (matching Fortran convention for INFO/IFAIL).
- The forward GOTO 160 (break out of nblk loop) is handled by setting j1 at the break point and using continue/break.

## Dependency interface surprises

- dlagtf/dlagts work together: dlagtf factorizes and dlagts solves. The TOL parameter is passed by reference in Fortran and modified by dlagts when job < 0. In JS, since scalars are by value, the modified TOL is not returned -- but dstein always passes TOL=0 initially and dlagtf sets it, then the same variable is passed to dlagts, so this works.
- dlaruv requires the iseed array to be Int32Array with stride/offset. It generates at most 128 values per call. The MM_TABLE must be stored in row-major order (each row = 4 values for one multiplier power).
- dlarnv calls dlaruv internally in batches of LV/2=64, handling the Box-Muller transform for normal distribution (idist=3) which needs 2x as many uniform random numbers.

## Automation opportunities

- The dlaruv MM_TABLE extraction from Fortran DATA statements was done via a Python script. This could be a general tool for extracting large DATA arrays from Fortran source.

## Coverage gaps

- Error validation paths (N < 0, M > N, bad IBLOCK ordering) not tested -- these are parameter validation, not algorithmic paths.
- The convergence failure path (ITS > MAXITS) is not tested because the well-conditioned test matrices always converge quickly.
- The reorthogonalization path (GPIND != J) is exercised by the 5x5 test with all eigenvectors since some eigenvalues are close.

## Complex number handling

- N/A: dstein is a real-valued routine.
