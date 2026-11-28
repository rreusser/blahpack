# dppcon: Translation Learnings

## Translation pitfalls

- dppcon is structurally almost identical to dpocon. The key difference is that it uses dlatps (packed triangular solver) instead of dlatrs (full-storage triangular solver). This means no 2D strides (strideA1, strideA2) -- only 1D strideAP/offsetAP.
- The Fortran WORK array is partitioned into three segments of N: WORK(1..N) for the solution vector, WORK(N+1..2N) for dlacn2's internal V, and WORK(2N+1..3N) for dlatps's CNORM. This maps directly using offset arithmetic.

## Dependency interface surprises

- dlatps uses the same stride parameter for both the packed matrix and the column-norm workspace, unlike dlatrs which has separate 2D stride parameters for the full matrix.
- The `normin` parameter is set to `'no'` on the first iteration, then `'yes'` thereafter, allowing dlatps to cache and reuse column norms. This is consistent with the dpocon pattern.

## Automation opportunities

- The dpocon-to-dppcon transformation is mechanical: swap dlatrs for dlatps, remove one stride dimension, adjust parameter lists. A codegen template could handle this.

## Coverage gaps

- The overflow bailout path (scale < |WORK(ix)| * SMLNUM) is difficult to trigger with normal test matrices. The ill-conditioned diagonal test (diag(1,1,1e-15)) exercises the near-singular path but doesn't quite trigger the overflow guard.

## Complex number handling

- N/A: dppcon is a real-valued routine.
