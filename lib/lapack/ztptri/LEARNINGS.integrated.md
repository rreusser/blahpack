# ztptri: Translation Learnings

## Translation pitfalls

- The upper packed diagonal index calculation uses triangular numbers. Fortran starts `JJ=0` and accumulates `JJ=JJ+J` (1-based), yielding positions 1, 3, 6 (1-based). The 0-based conversion starts `jj = (offset - 1) * 2` and adds `j * 2` each iteration to locate the correct real/imag pair in the reinterpreted Float64Array view.
- The lower triangular `JC` pointer must step backward by `(N - j + 1)` positions (not `N - j`), matching the Fortran `JC = JC - N + J - 2` formula. The same off-by-one pitfall documented for dtptri applies here.
- Complex element indexing requires multiplying by 2 throughout since `reinterpret()` exposes a Float64Array where each complex element occupies two consecutive slots (real, imaginary).

## Dependency interface surprises

- `ztpmv` base.js takes `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- AP and x can alias the same Complex128Array for in-place triangular matrix-vector products, which is essential for the column update step.
- `zscal` base.js takes `(N, za, x, strideX, offsetX)` where `za` is a `Complex128` instance, not separate real/imaginary parts.

## Automation opportunities

- The packed storage diagonal index calculation (triangular numbers with complex stride) appears in multiple complex packed routines. A shared helper would prevent the repeated `* 2` offset arithmetic and associated off-by-one bugs.

## Coverage gaps

- Singularity detection is tested via fixtures containing matrices with zero diagonal entries.
- Unit diagonal tests verify that the diagonal is treated as identity regardless of stored values.
- The `jclast` variable for lower triangular sub-matrix offsets is exercised by all lower triangular test cases with N > 1.

## Complex number handling

- Diagonal inversion uses `cmplx.divAt` (safe complex division via a scratch buffer) rather than inline `(a+bi)/(c+di)` formulas, avoiding overflow for large magnitudes.
- The scratch buffer is pre-allocated at module scope with numerator `(1, 0)` permanently stored in slots 0-1, so each division only writes the denominator into slots 2-3 before calling `cmplx.divAt`.
- `zscal` requires a `Complex128` instance for the scalar, constructed each iteration with `new Complex128(ajjR, ajjI)`.
