# zlarzt: Translation Learnings

## Translation pitfalls

- Fortran V is K x N with LDV as leading dimension. The fixture
  packs column-major with LDV=K. Must use strideV1=1, strideV2=K
  in tests, NOT strideV1=K, strideV2=1 (which would be row-major).
  Getting this wrong causes silent data corruption in K>1 tests
  while K=1 tests still pass (because both strides are 1).
- zlarzt only supports DIRECT='B', STOREV='R' in the reference
  Fortran. Forward/columnwise are documented but not implemented.
  The JS implementation follows the same restriction.

## Dependency interface surprises

- zlacgv(N, x, stride, offset): stride and offset are in complex
  elements (not Float64). It does its own *2 internally. This is
  consistent with other complex BLAS/LAPACK routines.
- zgemv for rowwise V: the x vector (V row i) uses strideV2 as
  its stride (walking along columns of V), and the A matrix
  (V rows i+1:K) uses strideV1/strideV2 normally.
- The zgemv call uses CZERO for beta (not ONE), unlike zlarft
  which accumulates. This means T column is overwritten, not
  accumulated.

## Complex number handling

- zlacgv handles conjugation in-place. The pattern is:
  conjugate V row, call zgemv, unconjugate V row. This avoids
  needing a conjugate-transpose variant of zgemv.
- No inline complex arithmetic needed - all complex ops go
  through zlacgv, zgemv, and ztrmv.
