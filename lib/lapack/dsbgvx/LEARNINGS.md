# dsbgvx: Translation Learnings

## Translation pitfalls

- The Fortran routine passes JOBZ directly to DSBGST, but the JS convention maps `'compute-vectors'` to `'update'` and `'no-vectors'` to `'none'` for dsbgst's vect parameter.
- The Fortran routine does not scale the matrix (unlike DSBEVX which uses DLANSB/DLASCL). This is because the generalized eigenproblem is already normalized by B.
- The `M` output (number of eigenvalues found) uses an `out` object pattern (`out.M`) since JavaScript cannot pass scalars by reference.

## Dependency interface surprises

- dsbgst uses `'update'`/`'none'` for its vect parameter, matching dsbtrd's convention. Both take `'update'` when vectors are needed.
- dstebz returns M and nsplit via Int32Array views (single-element arrays), requiring allocation of `new Int32Array(1)` for each.

## Automation opportunities

- The Fortran deps file needed significant manual expansion to include transitive dependencies (dstebz, dstein, dsterf, dsteqr, dcopy, dgemv, dswap, and their transitive BLAS/LAPACK deps). The auto-generated deps file only had 13 entries; the working file needs 45+.

## Coverage gaps

- Error path where dpbstf fails (B not positive definite) returning `info = N + dpbstf_info` is not tested with fixtures but the code path is straightforward.
- The fallback from dsteqr/dsterf failure to dstebz path is difficult to trigger with well-conditioned test matrices.

## Complex number handling

- N/A: dsbgvx is a real-valued routine.
