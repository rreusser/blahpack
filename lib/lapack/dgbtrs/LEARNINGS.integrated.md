# dgbtrs: Translation Learnings

## Translation pitfalls

- The Fortran code uses DTBSV (triangular band solve) to handle the U
  solve. The key insight is that the factored AB stores U as an upper
  triangular band matrix with KL+KU superdiagonals -- so the K parameter
  to DTBSV is `kl + ku`, not just `ku`.
- The KD variable (diagonal row in the factored band storage) is `ku + kl`
  (0-based), which differs from the original band storage diagonal position.
- For the transpose solve (A^T*X=B), the order is reversed: first solve
  U^T, then apply L^T in reverse order with reverse pivoting.
- IPIV is 0-based (from dgbtrf output). The swap comparison is `l !== j`
  (not `l !== j+1` as in Fortran 1-based).
- The `lnoti` flag (KL > 0) correctly skips all L-related operations when
  there are no subdiagonals, since the matrix is already upper triangular.

## Dependency interface surprises

- dtbsv uses the stride/offset API. For band storage, pass `sa1` and `sa2`
  directly (not `sa2 - sa1`). The band matrix is accessed with its native
  strides.
- dger and dgemv use different argument orders. dger takes (M, N, alpha,
  x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA).
  dgemv takes (trans, M, N, alpha, A, strideA1, strideA2, offsetA, x,
  strideX, offsetX, beta, y, strideY, offsetY).

## Automation opportunities

- The dgbtrf + dgbtrs solve pattern could be wrapped in a single dgbsv
  routine (as in LAPACK reference). This is a common convenience wrapper.

## Coverage gaps

- 100% line and branch coverage achieved on dgbtrs base.js.
- Tests verify the mathematical property A*x = b (not just fixture matching),
  which is more robust against pivot tie-breaking differences.
- Both transpose and non-transpose paths tested with pivoting and without.

## Complex number handling

- N/A - double precision only.
