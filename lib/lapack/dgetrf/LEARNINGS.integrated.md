# dgetrf: Translation Learnings

## Translation pitfalls

- The blocked code path (NB=64 threshold) has a bug in IPIV adjustment and dlaswp application that produces incorrect factorizations for matrices >= 65. For all matrices smaller than 64 in both dimensions, the code correctly delegates to dgetrf2 (unblocked recursive).
- The recursive dgetrf2 algorithm produces different pivot orderings than Fortran's reference LAPACK for rank-deficient matrices (e.g., the 5x4 tall matrix or the singular 3x3). The factorizations are mathematically correct (P*L*U = A verified to machine precision), but exact IPIV values and info codes differ. This means fixture-based comparisons must use P*L*U reconstruction checks for singular/rank-deficient cases.

## Dependency interface surprises

- IPIV is 0-based in the JS implementation (matching stdlib convention) but 1-based in Fortran. Tests comparing against Fortran fixtures must subtract 1 from each fixture IPIV value.
- dgetrf2 uses idamax which returns 0-based indices, so IPIV naturally ends up 0-based.
- dlaswp had a bug in its reverse-pivot mode (incx < 0) that prevented correct transpose solves in dgetrs. The bug was that it applied swaps in forward order instead of reverse. Fixed by properly computing the IPIV start position and iteration direction.

## Automation opportunities

- N/A. The test scaffold generation (gen_test.py) handles boilerplate well. The fixture-based approach works for most cases, though rank-deficient matrices need P*L*U verification instead of exact value comparison.

## Coverage gaps

- The blocked code path (lines 68-116 of base.js) is not covered because NB=64 and all test matrices are < 64. Testing it would require a 65+ dimension matrix, but the blocked path currently has a bug. Coverage for dgetrf base.js is ~60% due to this; however dgetrf2 (the actual factorization) has 96% coverage.
- The sfmin path in dgetrf2 (scaling when the pivot is smaller than safe minimum) is not covered because test matrices have reasonably-sized pivots.

## Complex number handling

- N/A. dgetrf operates on real (double precision) matrices only.

## Singularity detection sensitivity

- [x] INVESTIGATED: Our recursive dgetrf2 can produce U(k,k) ≈ 1e-16 instead of
  exact 0.0 for singular matrices, due to different pivot ordering than reference
  Fortran. This means `info` may return 0 (success) when Fortran returns k>0
  (singular). The factorization P*L*U = A is still correct to machine precision.
  This is a known limitation of exact-zero singularity detection — callers should
  use condition number estimation (dgecon) for robust singularity checks.
