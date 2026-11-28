# zpotf2: Translation Learnings

## Translation pitfalls

- Direct analog of dpotf2 but with complex dependencies (zdotc, zgemv, zdscal, zlacgv).
- zdotc returns a Complex128 object. Need `real(zdotc(...))` to extract the real part for the diagonal update. This is `DBLE(ZDOTC(...))` in Fortran.
- The diagonal element AJJ is always real for an HPD matrix. Must set imaginary part to 0.0 when writing back.
- zlacgv is called before and after zgemv to conjugate the column/row being used as a multiplier. Must undo the conjugation after zgemv returns.

## Dependency interface surprises

- zgemv takes Complex128 alpha and beta (not real). Must pass `new Complex128(1,0)` and `new Complex128(-1,0)` as CONE and CMONE.
- zdscal takes a real scalar (number), not Complex128. Consistent with Fortran ZDSCAL.
- zlacgv uses complex-element strides and offsets. Its 4th parameter is the complex-element offset, so pass `offsetA + j * strideA2` directly.

## Automation opportunities

- The dpotf2 -> zpotf2 translation pattern is very regular: replace ddot with zdotc (extract real), dgemv with zgemv (complex scalars), dscal with zdscal, add zlacgv calls. Could be partially automated.

## Coverage gaps

- 100% line and branch coverage achieved on zpotf2/base.js.

## Complex number handling

- No complex arithmetic is inlined in zpotf2 itself. All operations are delegated to BLAS routines (zdotc, zgemv, zdscal, zlacgv).
- The only direct Float64 manipulation is reading the diagonal (real part of the complex element) and writing back sqrt(ajj) with imaginary part 0.
