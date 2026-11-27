# zpbtf2: Translation Learnings

## Translation pitfalls

- Direct analog of dpbtf2 with complex BLAS calls (zdscal, zher, zlacgv).
- In the upper case, zlacgv must be called before and after zher to conjugate the super-diagonal vector. This is because zher expects x but the Fortran uses `conj(x)` form via ZLACGV. The lower case does NOT need zlacgv because the sub-diagonal vector is used as-is.
- KLD = MAX(1, strideAB2 - strideAB1) represents the diagonal stride through band storage. Same formula as dpbtf2.
- Diagonal element of the HPD band matrix is always real. After sqrt, must write ajj to real part and 0 to imaginary part.

## Dependency interface surprises

- zher takes a REAL alpha (not Complex128). This matches the Fortran signature where ALPHA is DOUBLE PRECISION.
- zher's strideA1/strideA2 parameters are in complex elements. When calling from zpbtf2, pass strideAB1 (complex) and kld (complex), not doubled values.
- zdscal and zlacgv both take complex-element strides/offsets.

## Automation opportunities

- The dpbtf2 -> zpbtf2 translation is mechanical: replace dscal with zdscal, dsyr with zher (plus zlacgv wrapper for upper case). Could be a transform.

## Coverage gaps

- 100% line and branch coverage achieved.

## Complex number handling

- No complex arithmetic is inlined in zpbtf2. All operations delegated to zher, zdscal, zlacgv.
- Only direct Float64 access is for reading/writing the real diagonal element.
