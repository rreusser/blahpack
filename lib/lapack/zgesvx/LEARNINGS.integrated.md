# zgesvx: Translation Learnings

## Translation pitfalls
- Close mirror of dgesvx but all matrix arrays (A, AF, B, X) are Complex128Array with complex-element strides
- Scaling B and X by real scale factors (r, c) requires reinterpret to Float64 view and scaling both re/im parts
- The norm strings for zlange/zlantr match exactly: 'max', 'one-norm', 'inf-norm' (same as dlange/dlantr)
- WORK is Complex128Array (for zgecon, zgerfs), RWORK is Float64Array - both must be large enough (2*N each)
- The 'factored' string maps to Fortran's 'F' - dgesvx already established this convention

## Dependency interface surprises
- zgecon, zgerfs, zlange, zlantr all take complex-element strides/offsets for matrix parameters
- zgeequ and zlaqge take Complex128Array A but return/use Float64Array for scale factors (r, c)
- zgecon returns rcond via a Float64Array[1] out-parameter, not as a return value

## Missing automation
- The dgesvx -> zgesvx conversion is mechanical: replace Float64Array matrix params with Complex128Array, add reinterpret for element scaling, change dependency requires from d* to z*

## Coverage gaps
- Line 223: the rpvgrw=0 fallback when zlantr returns zero (degenerate AF). Tested via singular case.
- Line 240: the norm selection for non-transpose case. Exercised by trans_N tests.
- Lines 290-291: the colcnd FERR division path when equilibrating with column scaling in non-transpose mode. Would need a specific equilibration test that triggers column-only scaling.

## Complex number handling
- Real-scalar times complex for B/X scaling: access via Float64 view, multiply both components
- No complex arithmetic in zgesvx itself - all complex math delegated to dependencies (zgetrf, zgetrs, zgerfs, zgecon)
