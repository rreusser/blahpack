# dggbak: Translation Learnings

## Translation pitfalls

- Fortran test array reuse caused invalid RSCALE values (0.0 as a permutation index) in the ilo_eq_ihi test case. RSCALE entries outside [ILO,IHI] must contain valid 1-based row indices for permutation -- stale zeros from a prior test produce undefined behavior. Fixed by explicitly setting RSCALE(3) = 4.0 instead of 0.0.
- dggbak is nearly identical to zggbak but uses dscal/dswap instead of zdscal/zswap, and V is Float64Array instead of Complex128Array. No stride multiplication by 2 needed.

## Dependency interface surprises

- dscal and dswap use the standard `(N, alpha, x, stride, offset)` and `(N, x, strideX, offsetX, y, strideY, offsetY)` signatures. No surprises.

## Automation opportunities

- N/A: The scaffold generator and init_routine.py handled everything cleanly.

## Coverage gaps

- N/A: 100% line and branch coverage achieved on base.js. All code paths (scale, permute, both, left, right, quick returns, ilo=ihi, ilo=1, ihi=N, k=i) are exercised.

## Complex number handling

- N/A: dggbak is a real-valued routine.
