# zlanht: Translation Learnings

## Translation pitfalls

- Hermitian tridiagonal has real diagonal (Float64Array) and complex off-diagonal (Complex128Array). This is unlike zlangt where all three arrays are complex.
- The one-norm and infinity-norm are identical for Hermitian matrices, so they share one branch (matching the Fortran source which tests `LSAME(NORM,'O') .OR. NORM.EQ.'1' .OR. LSAME(NORM,'I')`).
- For the `abs(E(I))` calls, must use `cmplx.absAt` on the reinterpreted Float64 view, not `Math.abs`.

## Dependency interface surprises

- Frobenius norm uses both `dlassq` (for real diagonal D) and `zlassq` (for complex off-diagonal E). The `sum = 2*SUM` doubling accounts for the conjugate-transpose off-diagonal contributing equally.
- `zlassq` takes `(N, x, stride, offset, scale, sumsq)` with stride/offset in complex elements, while `dlassq` uses real element strides.

## Automation opportunities

- None identified; the scaffold and gen_test pipeline worked well.

## Coverage gaps

- NaN propagation paths are not explicitly tested but follow the same `sum !== sum` pattern as dlanst.

## Complex number handling

- E is Complex128Array; `reinterpret` converts to Float64 view for indexed access via `cmplx.absAt`.
- Strides and offsets for E must be doubled when converting from complex element units to Float64 indices.
- D is plain Float64Array (real diagonal), so `Math.abs` is used directly.
