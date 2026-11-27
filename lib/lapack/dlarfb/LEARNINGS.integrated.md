# dlarfb: Translation Learnings

## Translation pitfalls

- [x] The real version uses 'T' (transpose) where the complex version uses 'C' (conjugate transpose). The transt variable is set to 'T' when trans='N' and 'N' when trans='T'.
- [x] The C1 update loop (C1 -= W^T for left, C1 -= W for right) is simpler in real: no conjugation of WORK values.
- [x] STOREV='R' (row-wise) is not implemented -- throws an error. Only STOREV='C' (column-wise) is supported, which covers the standard QR factorization use case.
- [x] Both Forward and Backward directions are implemented for STOREV='C'.

## Dependency interface surprises

- [x] dcopy, dgemm, dtrmm all take real scalars (not 2-element Float64Array). Required implementing dtrmm which was not previously available.
- [x] dgemm alpha/beta are scalar numbers, not arrays. The complex zgemm takes Float64Array constants.

## Automation opportunities

- [x] The real dlarfb is a line-by-line simplification of zlarfb: remove all conjugate logic, change z-prefixed calls to d-prefixed calls, remove interleaved index arithmetic.

## Coverage gaps

- [x] Left+NoTrans, Left+Trans, Right+NoTrans (Forward, Columnwise), and M=0 quick return are tested. Backward direction branches are implemented but not directly tested via dlarfb tests -- they are exercised through dgeqrf backward application paths.

## Complex number handling

- [x] N/A. Real-valued only. The complex zlarfb uses zlacgv for conjugation and interleaved storage.
