# Dependency Calling Convention Reference

Surprises that have caused integration bugs. Check this before calling
a routine for the first time.

| Routine | Gotcha |
|---------|--------|
| `dlarfg`/`zlarfg` | alpha and tau are `(array, offset)`, not scalars — written in place |
| `dlarf` vs `zlarf` | Real: tau is a plain number. Complex: tau is `(Complex128Array, offset)` |
| `zlarfb` | Takes 2D WORK strides `(strideWork1, strideWork2)` |
| `dlarfb`/`dtprfb` | WORK is logically 2D (`ldwork × nb`). When passing a 1D buffer, set strides as `(1, ldwork)` and pre-compute `ldwork = N` (left side) or `M` (right side). An undersized buffer makes the callee throw (CONVENTIONS W3). |
| `zgeqr2` | Takes 1D WORK `(WORK, strideWork, offsetWork)` |
| `zlaqps` | Returns KB as a scalar (Fortran uses output parameter) |
| `zladiv` | `zladiv( x, offsetX, y, offsetY, out, offsetOut )`: inputs and result are `(Complex128Array, offset)` pairs; writes the quotient to `out` |
| `dtrsm` | Works correctly with same array A as both operator and target |
| `drotmg` | dd1/dd2 are `(D, strideD, offsetD)` array, dx1 is `(x1, strideX1, offsetX1)` array — scalar in/out params are arrays, not plain numbers. dy1 is a plain scalar (input-only). |

Add new entries here as they are discovered.
