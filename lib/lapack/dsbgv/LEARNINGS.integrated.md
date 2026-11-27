# dsbgv: Translation Learnings

## Translation pitfalls

- dsbgv is a thin driver that orchestrates five subroutines. The main
  pitfall is mapping Fortran character flags to their JS string equivalents
  at each call site.
- Fortran JOBZ='V' maps to different JS strings at different call sites:
  `'update'` for dsbgst (vect param), `'update'` for dsbtrd (vect param),
  and `'update'` for dsteqr (compz param). Passing `'compute'` or
  `'compute-vectors'` to dsteqr causes a silent -1 return (invalid param).
- WORK array partitioning: INDE=0, INDWRK=N. The off-diagonal E array
  occupies WORK[0..N-1] and scratch occupies WORK[N..3N-1]. The same
  WORK array is passed to dsbtrd and dsteqr with different offset segments.

## Dependency interface surprises

- dsteqr compz values in JS are `'none'`, `'update'`, `'initialize'`
  (not `'no-vectors'`/`'compute-vectors'`). The driver must translate
  JOBZ semantics to the correct compz value.
- dpbstf returns info > 0 when B is not positive definite; dsbgv must
  add N to this value before returning (info = N + info) so the caller
  can distinguish B-factorization failure from eigenvalue convergence failure.
- Fortran deps file needed `la_constants` and `la_xisnan` modules added
  because dlassq.f90 uses Fortran modules.

## Automation opportunities

- The generalized eigenvalue driver pattern (factor B, transform, reduce,
  solve tridiagonal) is shared by dsbgv, dsbgvd, dsbgvx. A template could
  generate these drivers.

## Coverage gaps

- All major code paths are covered: upper/lower, KA/KB combinations
  (0/0, 2/1, 3/2), N=0/1/3/5/8, JOBZ=no-vectors/compute-vectors.
- The eigenvectors are verified against Fortran reference fixtures.
  B-orthogonality (Z^T*B*Z = I) is not explicitly tested since the
  generalized eigenproblem eigenvectors are B-orthogonal, not I-orthogonal.

## Complex number handling

- N/A: dsbgv is a real-valued routine.
