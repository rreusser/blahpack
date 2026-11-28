# dla_porcond: Translation Learnings

## Translation pitfalls

- dlacn2 reverse communication produces different condition number estimates
  in JS vs Fortran for cmode=0 cases. Root cause: dpotrs produces near-equal
  values (all ~1.0) when the unscaled matrix is well-conditioned, causing
  idamax tie-breaking to select different columns. Both estimates are valid
  lower bounds. Used 15% relative tolerance for cmode=0 fixture comparisons.
- Fortran deps file for run_fortran.sh needed dpotrf, dpotrf2, disnan,
  dlaisnan beyond the direct deps (dlacn2, dpotrs). Always check transitive
  compile deps when running Fortran tests.

## Dependency interface surprises

- dpotrs expects 2D stride args (strideB1, strideB2) even when solving with
  a single-column vector (NRHS=1). For a vector with element stride s,
  pass strideB1=s, strideB2=N*s. This matches Fortran LDB=N convention.
- dlacn2 allocates internal state arrays (KASE, EST, ISAVE) as typed arrays
  rather than scalars since JS doesn't have pass-by-reference.

## Coverage gaps

- The `ainvnm === 0` branch (returns 0.0) is unreachable for SPD matrices
  since they are always invertible. Accepted as uncovered.
