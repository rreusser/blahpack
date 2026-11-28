# dgesv: Translation Learnings

## Translation pitfalls

- dgesv is a thin wrapper that calls dgetrf then dgetrs. There are no indexing or stride complications in dgesv itself. All complexity lives in the dependencies.
- For singular matrices, the exact info value (which diagonal of U is zero) may differ from Fortran due to different pivot orderings in the recursive dgetrf2 algorithm. Tests should check info > 0 rather than matching the exact Fortran info value.
- For non-singular systems, the solution vector matches Fortran fixtures exactly because the forward solve path is deterministic once the factorization is correct.

## Dependency interface surprises

- dgesv passes strideA1/strideA2 for both A and B to its dependencies, and the caller must provide both. The N-by-N A matrix uses strideA2=N for column-major, and the N-by-NRHS B matrix uses strideB2=N (not NRHS).
- The IPIV output from dgesv is 0-based (JS convention), unlike Fortran's 1-based. Tests comparing IPIV against Fortran fixtures must account for this offset.

## Automation opportunities

- N/A. dgesv tests are simple: set up A and B, call dgesv, verify A_orig * x = b_orig using matrix-vector multiplication.

## Coverage gaps

- base.js achieves 100% line and branch coverage. The quick-return paths (N=0, NRHS=0) and the info > 0 (singular) path are all covered.

## Complex number handling

- N/A. dgesv operates on real (double precision) matrices only.
