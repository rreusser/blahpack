# dppsv: Translation Learnings

## Translation pitfalls

- Straightforward driver: dppsv is a thin wrapper calling dpptrf then dpptrs.
  No index arithmetic or loop translation required.
- Unlike dspsv, dppsv has no IPIV output (Cholesky vs. diagonal pivoting).
  The signature is simpler: no pivot array parameters.

## Dependency interface surprises

- dpptrf returns integer info (0 = success, k>0 = not positive definite).
- dpptrs returns integer info (always 0 for valid input).
- Both use 1D packed storage with (AP, strideAP, offsetAP) convention.
- B uses 2D striding (strideB1, strideB2, offsetB).

## Automation opportunities

- The scaffolder generated the dppsv.js LAPACK-style wrapper as a stub.
  For simple drivers, the LAPACK-style wrapper could be auto-generated
  since it just maps (uplo, N, nrhs, AP, B, LDB) to ndarray form.

## Coverage gaps

- base.js has 100% line and branch coverage.
- ndarray.js line 72 (N<0 combined with nrhs<0) is the only uncovered
  branch, which is a validation edge case.

## Complex number handling

- N/A: dppsv is a real-valued routine.
