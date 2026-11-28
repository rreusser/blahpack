# dpprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing for abs(A)*abs(X)+abs(B) uses a `kk` counter to
  track position in the packed array. Upper uses `kk += k+1`, lower uses
  `kk += N-k`. The Fortran is 1-based, so `AP(KK+K-1)` for the diagonal
  in upper becomes `AP[kk+k]` in 0-based JS (since kk already starts at 0).
- The dpptrs call inside the refinement loop and dlacn2 loop passes `nrhs=1`
  and uses `WORK(N:2N-1)` as the RHS vector. The strideB2 parameter for
  dpptrs is `N*strideWORK` (leading dimension), not the workspace stride itself.
- WORK is partitioned into 3 segments of N: indices [0..N-1] hold abs values,
  [N..2N-1] hold the residual/solution, [2N..3N-1] hold dlacn2 V workspace.

## Dependency interface surprises

- dspmv uses packed 1D storage with (uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY). The stride for AP
  is always 1 (sequential packed elements).
- dpptrs takes (uplo, N, nrhs, AP, strideAP, offsetAP, B, strideB1, strideB2, offsetB) -- note B is treated as 2D with two strides.
- dlacn2 uses reverse communication with KASE/ISAVE as Int32Array state;
  EST is a Float64Array[1] for the estimate. Must copy EST[0] to/from
  FERR[j] on each iteration.

## Automation opportunities

- The Fortran deps file needed manual addition of dpptrf (used only in test
  setup, not in dpprfs itself). A tool that scans the test .f90 for CALL
  statements and auto-adds them to deps would help.

## Coverage gaps

- Lines 193-194: safe1/safe2 small-value branch in BERR computation. Only
  triggers when WORK values are near machine minimum.
- Lines 200-207: iterative refinement loop body. Requires initial solution
  with enough backward error to trigger refinement (BERR > EPS).
- Lines 221-222: safe1 branch in FERR setup. Same machine-minimum condition.
- All are standard numerical corner cases that match the Fortran reference.

## Complex number handling

- N/A: dpprfs is a real-valued routine.
