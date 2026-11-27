# zdotc: Translation Learnings

## Translation pitfalls

- The signature generator (`bin/signature.py`) generates a signature with both `strideX`/`offsetX` AND `incx` for complex FUNCTION routines, plus returns `number` instead of `Complex128`. This is incorrect for complex functions. The correct base.js signature uses `strideX, offsetX` only (no separate incx), and returns `Complex128`. The ndarray wrapper handles the Fortran INCX-to-stride/offset conversion.
- Fortran's ZDOTC is a `COMPLEX*16 FUNCTION`, not a SUBROUTINE. The JS equivalent returns a `new Complex128(realPart, imagPart)` rather than writing to an output parameter.
- The Fortran has separate code paths for unit-stride (INCX=1 AND INCY=1) vs general stride. The unit-stride path is a performance optimization that is not needed in JS since we do not unroll. A single loop with stride/offset handles all cases.

## Dependency interface surprises

- N/A. zdotc is a leaf routine with no dependencies beyond Complex128 and reinterpret.

## Automation opportunities

- The signature generator should be updated to handle COMPLEX*16 FUNCTION return types, emitting `Complex128` instead of `number`, and avoiding the redundant `incx`/`incy` parameters that are already consumed into stride/offset.
- For complex BLAS functions (zdotc, zdotu), the scaffold generator creates a stub that lists `Float64Array` types instead of `Complex128Array` for the input parameters. The scaffold should detect z-prefix routines and use complex types.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.
- The Fortran reference has a separate unit-stride code path that was not preserved in JS (deliberate simplification). The Fortran fixture still validates both paths since we test with stride=1 and stride=2.

## Complex number handling

- Conjugated multiplication `conj(x)*y` was safely inlined: `(xr*yr + xi*yi) + (xr*yi - xi*yr)*i`. This is pure addition/subtraction/multiplication with no division or absolute value, so inlining is safe per the complex number docs.
- The `reinterpret` pattern was used for Float64Array views. Complex-element strides/offsets are multiplied by 2 to get Float64 indices, consistent with the BLAS convention (complex-element strides, routine does `*2` internally).
- Return value is `new Complex128(tempR, tempI)` -- one allocation per call. This is unavoidable for functions returning complex scalars.
