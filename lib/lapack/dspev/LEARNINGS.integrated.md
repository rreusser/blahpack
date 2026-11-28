# dspev: Translation Learnings

## Translation pitfalls

- Fortran DSPEV passes JOBZ='V' directly to DSTEQR, where COMPZ='V' means "update Z in place." In the JS translation, this maps to `'update'` (not `'compute'` or `'initialize'`), since dopgtr has already placed Q into Z before dsteqr is called.
- WORK is partitioned into three segments: E (off-diagonal, length N), TAU (reflector scalars, length N), and scratch (length N). The TAU segment is reused as dsteqr workspace after eigenvector generation.
- The N=1 quick return sets Z[0]=1.0 and w[0]=AP[0] directly, bypassing all subroutine calls.

## Dependency interface surprises

- dlansp uses `'max'` norm (not `'M'`) in the stdlib-js string convention.
- dsteqr `'update'` corresponds to Fortran COMPZ='V' (update existing orthogonal matrix), while `'initialize'` corresponds to COMPZ='I' (set Z to identity first).
- dsptrd signature has separate d/e/TAU output arrays (diagonal, off-diagonal, reflectors), all sharing the WORK buffer via offset partitioning.

## Automation opportunities

- The deps file generator (`deps.py`) misses Fortran module dependencies (`la_constants`, `la_xisnan`) needed by `dlassq.f90`. These must be added manually for test compilation.

## Coverage gaps

- The convergence failure path (info > 0) from dsteqr/dsterf is not tested because constructing a matrix that fails to converge is non-trivial. The rescaling path for partial convergence (imax = info - 1) is therefore untested.
- Scaling paths (near-underflow and near-overflow) are tested with synthetic matrices and verified via eigendecomposition checks.

## Complex number handling

- N/A: dspev is a real-valued routine.
