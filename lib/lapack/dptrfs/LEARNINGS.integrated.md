# dptrfs: Translation Learnings

## Translation pitfalls

- Fortran WORK array is split: WORK(1..N) for |A|*|X|+|B|, WORK(N+1..2N) for residual R. In JS with stride/offset, these become offsetWORK + i*strideWORK and offsetWORK + (N+i)*strideWORK respectively.
- The backward GOTO (label 20) for iterative refinement translates to a while(true)/break pattern with continue for the "retry" path.
- idamax returns 0-based index in JS, so no subtraction needed when indexing WORK.
- dpttrs called internally with nrhs=1 for solving residual correction. Must pass the correct offset into WORK (the residual portion at N*strideWORK).

## Dependency interface surprises

- dpttrs takes 2D stride parameters (strideB1, strideB2, offsetB) even for single-column solves. When passing a slice of WORK as a single-column "matrix", strideB2 is irrelevant (set to 1) but strideB1 must match strideWORK.
- daxpy signature: (N, alpha, x, strideX, offsetX, y, strideY, offsetY) -- straightforward.

## Automation opportunities

- The deps file needed manual editing to add dpttrf (used only in the Fortran test, not in dptrfs itself). The init_routine.py tool only generates deps for the routine itself, not for test setup dependencies. Could add a --test-deps flag.

## Coverage gaps

- SAFE2 threshold branches (lines 168-169, 199-200) only trigger with near-underflow input values. These are the guarded division paths that add SAFE1 when denominators are tiny. Would need inputs with magnitudes near 1e-308 to exercise.
- 98.35% line coverage, 91.30% branch coverage achieved without special effort.

## Complex number handling

- N/A: dptrfs is a real (double precision) routine with no complex arithmetic.
