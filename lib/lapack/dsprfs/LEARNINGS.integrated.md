# dsprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing: The KK pointer advances by `k+1` for upper and `N-k` for lower
  (0-based). The Fortran uses 1-based KK, so the JS translation must be careful: upper uses
  `kk += k + 1` and lower uses `kk += N - k`. The diagonal element is at `kk + k` for upper
  and `kk` for lower.
- The Fortran code's `AP(IK)` indexing maps to `AP[ offsetAP + (ik * strideAP) ]` in JS,
  where `ik` is a 0-based packed index.

## Dependency interface surprises

- dspmv takes `(uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY)` --
  no 2D strides since AP is 1D packed.
- dsptrs takes `(uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB)` --
  the B matrix uses 2D strides for column-major layout.
- WORK and IWORK parameters are accepted in the signature but allocated internally (matching dsyrfs pattern).

## Automation opportunities

- The packed-storage abs(A)*abs(X) computation is the only part that differs significantly
  from dsyrfs. A shared helper for packed symmetric row-sum could reduce duplication.

## Coverage gaps

- Lines 187-188, 215-216 (safe2 else-branches) are uncovered. These trigger only when matrix
  values are extremely small (near SAFMIN). Would require constructing a matrix with values
  near 1e-308 to cover.

## Complex number handling

- N/A: dsprfs is a real-valued routine.
