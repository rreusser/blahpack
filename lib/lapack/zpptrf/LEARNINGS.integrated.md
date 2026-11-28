# zpptrf: Translation Learnings

## Translation pitfalls

- Complex packed storage index tracking is the same as the real dpptrf, but every complex element occupies two Float64 slots. The base.js operates on Complex128Array with complex-element strides/offsets, but the underlying Float64 view uses `sap = strideAP * 2` and `oAP = offsetAP * 2`. Getting this factor-of-2 wrong produces silent data corruption.
- When setting the diagonal after sqrt or on failure, both real AND imaginary parts must be written. Forgetting to zero the imaginary part (`APv[... + 1] = 0.0`) leaves stale imaginary data on the diagonal, which is mathematically invalid for a Hermitian matrix.
- The upper branch uses ztpsv with `'conjugate-transpose'` (not `'transpose'`). Using plain transpose would compute the wrong factorization for complex matrices -- the result would still "look right" for purely real inputs, making this a difficult bug to catch without complex-valued test cases.

## Dependency interface surprises

- zdotc returns a Complex128 object, not a scalar. To extract the real part for the AJJ computation, use `real(zdotc(...))` where `real` is `@stdlib/complex/float64/real`. The Fortran code uses `DBLE(ZDOTC(...))`.
- zhpr takes `(uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP)` with alpha as a real scalar (not complex). This matches the Fortran interface where alpha is DOUBLE PRECISION.
- ztpsv takes `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- 10 parameters. The trans parameter uses stdlib string values like `'conjugate-transpose'`, not single characters.

## Automation opportunities

- The dpptrf-to-zpptrf pattern (ddot->zdotc, dscal->zdscal, dspr->zhpr, dtpsv->ztpsv plus reinterpret + Complex128Array) is mechanical. A transform that lifts d-prefix packed routines to z-prefix could automate most of this, with the main manual step being the conjugate-transpose flag and diagonal imaginary zeroing.

## Coverage gaps

- 100% line and branch coverage achieved. No gaps.

## Complex number handling

- Diagonal elements of a Hermitian matrix are always real. After computing sqrt(ajj), both the real and imaginary parts are explicitly set (imaginary to 0.0).
- zdotc computes the conjugate dot product conj(x)^T*y. Only the real part is needed for AJJ since the dot product of a vector with itself is always real for the conjugate dot product.
- zdscal scales by a real scalar, so the scaling in the lower branch (1/ajj) correctly scales both real and imaginary parts of the sub-diagonal elements.
