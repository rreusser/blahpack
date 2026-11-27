# dtbsv: Translation Learnings

## Translation pitfalls

- Fortran's KX computation (`KX = 1 - (N-1)*INCX`) handles negative strides
  internally. In stdlib-js stride/offset API, the caller provides offsetX
  directly -- so this KX logic must be removed (just use `kx = offsetX`).
- Band storage has different row indexing for upper vs lower:
  - Upper: diagonal at row K (0-based), element A(i,j) at row K+i-j
  - Lower: diagonal at row 0 (0-based), element A(i,j) at row i-j
- The Fortran `L = KPLUS1 - J` offset trick converts from global row/column
  indices to band row indices. The same pattern applies in JS.
- Fortran test arrays must be declared with matching LDAB dimensions (e.g.,
  `AB(2,10)` not `AB(10,10)`) or the column stride will be wrong.

## Dependency interface surprises

- N/A - dtbsv is a leaf BLAS routine with no dependencies.

## Automation opportunities

- Band matrix test setup is mechanical but varies by K and uplo. A helper
  function to fill band storage from a full matrix would reduce test boilerplate.

## Coverage gaps

- 100% line and branch coverage achieved.
- All 8 parameter combinations tested: upper/lower x N/T x unit/non-unit.
- Non-unit strides (stride=2) and negative strides tested.

## Complex number handling

- N/A - double precision only.
