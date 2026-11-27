# zgtrfs: Translation Learnings

## Translation pitfalls

- DL, D, DU are separate Complex128Arrays from B and X. Must create separate Float64 views (DLv, dv, DUv) for cabs1 calls in the backward error computation. Initially used Bv for all, which would read garbage data.
- The Fortran uses `DCMPLX(ONE)` for the zaxpy alpha, translated as CONE = Complex128(1,0).
- In the Fortran, the 'T' (transpose) and 'C' (conjugate-transpose) cases both map through `LSAME`. In JS, the forward error uses 'conjugate-transpose' when NOTRAN (matching the Fortran which uses 'C'), and 'no-transpose' for the opposite.

## Dependency interface surprises

- zgttrs/zgtts2 uses Float64-based strides for B (strideB1, strideB2, offsetB are in Float64 units), while all other complex arrays (DL, D, DU, etc.) use complex-element strides. Must convert: pass `sw = strideWORK * 2` and `oW = offsetWORK * 2` for the WORK array used as B in zgttrs calls.
- zlagtm uses complex-element strides for everything (DL, D, DU, X, B).
- zlacn2 uses complex-element strides for V and X, plus real-valued EST/KASE arrays.
- zaxpy/zcopy use complex-element strides/offsets.

## Automation opportunities

- The backward error computation (RWORK = |B| + |A|*|X| using CABS1) is mechanically identical between dgtrfs and zgtrfs except for CABS1 vs Math.abs. Could generate the notran/trans blocks from a template.

## Coverage gaps

- Only tested 'no-transpose' and 'conjugate-transpose', not 'transpose'. The Fortran ZGTRFS supports all three via LSAME, but the transpose path uses the same code as conjugate-transpose (swapping DL/DU roles). The forward error path correctly uses the adjoint for complex matrices.
- Did not test cases that trigger iterative refinement (BERR > EPS). The well-conditioned matrices produce solutions near machine precision on the first solve.

## Complex number handling

- CABS1(z) = |re(z)| + |im(z)| used throughout for backward error. Implemented as local helper `cabs1(v, idx)` operating on Float64 views.
- Complex multiplication (RWORK[i] * WORK[i]) is a real-scalar-times-complex operation, inlined as separate real/imag multiplications.
- No complex division or square root needed (no need for cmplx.js).
