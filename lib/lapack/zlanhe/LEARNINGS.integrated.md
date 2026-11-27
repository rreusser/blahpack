# zlanhe: Translation Learnings

## Translation pitfalls

- Hermitian matrix diagonal elements are real. For max-norm, must take `Math.abs(Av[ai])` (real part only), not the full complex modulus. The Fortran uses `ABS(DBLE(A(J,J)))`.
- For the one-norm / infinity-norm, off-diagonal element magnitudes use `sqrt(re*re + im*im)` (complex modulus), while diagonal elements use `abs(real_part)`.
- In the Frobenius norm, the off-diagonal sum uses `zlassq` which takes Complex128Array strides in complex elements, but the diagonal loop manually iterates over the Float64 view to access only the real part. Must get the scaling arithmetic (`if (scale < absa)` swap) correct to match Fortran.
- The Frobenius norm in dlansy uses `dlassq` on the diagonal with stride `strideA1 + strideA2`. For zlanhe, diagonal elements are only their real parts, so we must manually add them to the sum-of-squares with the scale/sumsq accumulation logic rather than calling zlassq.

## Dependency interface surprises

- `zlassq` takes Complex128Array and complex-element strides/offsets. It handles the Float64 reinterpretation internally. This matches the calling convention in the Fortran where `CALL ZLASSQ(J-1, A(1,J), 1, SCALE, SUM)` passes complex array with stride 1 (in complex elements).

## Automation opportunities

- The structure closely mirrors dlansy. A mechanical transform could potentially generate zlanhe from dlansy by: (1) adding `reinterpret`, (2) changing `Math.abs(A[ai])` to complex modulus for off-diag, (3) changing diagonal access to `Math.abs(Av[ai])` (real part only), (4) replacing `dlassq` with `zlassq`.

## Coverage gaps

- Lines 212-213 are the `else` fallback for unknown norm type, returning 0. Low priority.
- zlassq's Blue's scaling constants (TBIG, TSML paths) not exercised because the test matrices have moderate values.

## Complex number handling

- No complex arithmetic library calls needed; only `Math.sqrt(re*re + im*im)` for off-diagonal modulus and `Math.abs(re)` for diagonal real part.
- `reinterpret()` used at function entry to get Float64Array view of the Complex128Array.
- `zlassq` dependency handles complex elements natively (processes real and imaginary parts separately internally).
