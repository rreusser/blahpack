# zhpgst: Translation Learnings

## Translation pitfalls

- The Fortran itype>=2, lower branch stores the full complex result of `AP(JJ) = AJJ*BJJ + ZDOTC(...)` including the imaginary part from ZDOTC. This is critical because ZTPMV operates on AP(JJ) afterward and needs the full complex value. Taking only `real(zdotc)` and zeroing the imaginary part breaks the ZTPMV computation with large errors (~5.0 vs ~0). The itype=1 branches can safely zero the imaginary part because no subsequent operation reads it.

- Complex-element strides/offsets require multiplication by 2 when accessing the underlying Float64Array view (`reinterpret`), but BLAS/LAPACK dependency calls use complex-element strides/offsets directly. Mixing up the two levels is the most common source of bugs.

## Dependency interface surprises

- `zaxpy` takes a Complex128 scalar (not a real number like `daxpy`). Even when the scalar is mathematically real (e.g. `CT = -0.5*AKK`), it must be wrapped in `new Complex128(value, 0.0)`.
- `zdscal` takes a real scalar (not Complex128), unlike other z-prefix BLAS routines.
- `ztpsv` and `ztpmv` use string `'conjugate-transpose'` (not `'Conjugate transpose'` as in Fortran).
- `zdotc` returns a Complex128 object. Use `real(zdotc(...))` to extract the real part for diagonal updates, and `imag(zdotc(...))` when the full complex result is needed.

## Automation opportunities

- The pattern of creating Fortran tests with EQUIVALENCE for complex arrays and calling zpptrf before zhpgst is very repetitive across Hermitian packed routines.

## Coverage gaps

- All 4 branches (itype=1 upper/lower, itype>=2 upper/lower) are tested with N=3 and N=4 matrices, plus edge cases N=0 and N=1.
- ITYPE=2 and ITYPE=3 produce identical results for the same inputs (they differ only in problem interpretation, not in the transformation applied).

## Complex number handling

- Diagonal elements of Hermitian matrices must have zero imaginary part. The code explicitly zeros imaginary parts after diagonal updates in itype=1 and itype>=2-upper branches. The itype>=2-lower branch preserves the full complex ZDOTC result temporarily for ZTPMV, so the final diagonal imaginary parts are floating-point noise (~1e-15), not exactly zero.
- CONE = (1,0) and CNONE = (-1,0) are module-level Complex128 constants used as alpha parameters for zhpmv/zhpr2.
