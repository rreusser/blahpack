# dgtrfs: Translation Learnings

## Translation pitfalls

- **WORK array offset bug**: The Fortran uses WORK(N+1) as the start of the residual vector (1-based). In 0-based JS, this maps to WORK[N]. When passing WORK as a B matrix to dlagtm or dgttrs, the offset must be `offsetWORK + N*strideWORK`, NOT just `offsetWORK`. This was the primary bug during implementation -- all three dgttrs calls and the dlagtm call needed the N*strideWORK offset added.
- The Fortran uses WORK(1..N) for the row-sum bounds, WORK(N+1..2N) for the residual/solution, and WORK(2N+1..3N) as workspace for dlacn2. The dlacn2 V array is at 2N offset, X array at N offset.
- The GO TO 20 backward jump in Fortran maps to a `while(true) { ... break; }` loop with the convergence test before the break.

## Dependency interface surprises

- dlagtm takes separate strideB2 and offsetB parameters. When using a contiguous 1D workspace as a single-column matrix, strideB2 can be any value (only one column), but offsetB must point to the actual data start.
- dgttrs uses long-form strings: 'no-transpose', 'transpose' (not 'N'/'T').

## Automation opportunities

- The WORK-offset pattern (Fortran WORK(N+1) -> JS offsetWORK + N*strideWORK) recurs in many iterative refinement routines. A lint check could flag bare `offsetWORK` in dgttrs/dlagtm calls inside refinement loops.

## Coverage gaps

- The safe1/safe2 branch in backward error computation is partially covered (98.36% line). The `WORK[pw] <= safe2` path would require inputs near underflow.

## Complex number handling

- N/A: dgtrfs is a real-valued routine.
