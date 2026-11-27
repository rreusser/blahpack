# zsyrfs: Translation Learnings

## Translation pitfalls
- Complex version of dsyrfs. Uses CABS1 (|re|+|im|) instead of abs() for componentwise error bounds.
- Allocates workspace internally: Complex128Array for residual/zlacn2, Float64Array for RWORK.
- zsymv used for residual computation (NOT zhemv -- symmetric!).
- zsytrs used for solve steps in both refinement and condition estimation.
- zlacn2 uses Complex128Array V and X (not Float64Array like dlacn2).
- RWORK scaling of WORK: multiply each complex element's re and im by the same real scalar.

## Dependency interface surprises
- zlacn2 complex interface: V and X are Complex128Array with stride/offset in complex elements.
- zsytrs takes 4th parameter as stride for B's second dimension (N for column-major N-by-1).

## Missing automation
- N/A.

## Coverage gaps
- Tested indirectly through zsysvx. Direct testing with known ill-conditioned matrices would exercise more refinement iterations.

## Complex number handling
- cabs1 helper returns |re|+|im| matching Fortran's CABS1 statement function.
