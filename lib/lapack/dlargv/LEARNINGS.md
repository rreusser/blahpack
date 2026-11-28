# dlargv: Translation Learnings

## Translation pitfalls

- No index pitfalls: the routine uses simple 1D stride/offset patterns with no matrix indexing. The Fortran uses 1-based IX/IY/IC cursors which map directly to 0-based offset + stride increments in JS.
- The four branches (g=0, f=0, |f|>|g|, else) each write to different subsets of x/y/c. Easy to miss that the f=0 branch writes x[ix]=g AND y[iy]=1 (not just c[ic]=0).

## Dependency interface surprises

- N/A: dlargv has no dependencies.

## Automation opportunities

- The BLAS/LAPACK-style wrapper (`dlargv.js`) scaffold emits a stub that throws. For routines with only 1D array params and no string/enum params, the wrapper is purely mechanical (stride2offset for each array). Could be auto-generated.

## Coverage gaps

- 100% line and branch coverage achieved. All four code paths are straightforward to trigger with simple inputs.

## Complex number handling

- N/A: dlargv is a real-valued routine.
