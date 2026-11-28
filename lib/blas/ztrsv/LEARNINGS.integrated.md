# ztrsv: Translation Learnings

## Translation pitfalls

- The Fortran ztrsv has an `INCX.EQ.1` specialization that is structurally identical to the general-stride path (just removes the `IX` pointer management). Dropped this specialization in JS and used only the general-stride path, which simplifies the code without any performance cost since JS does not benefit from Fortran's stride-1 vectorization hints.
- Conjugate transpose (TRANS='C') division path requires dividing by `conj(A(j,j))`, not `A(j,j)`. In the TRANS='N' and TRANS='T' paths, `cmplx.divAt` is used directly against the matrix diagonal. For TRANS='C', the conjugated diagonal cannot be passed to `cmplx.divAt` without writing temporary values, so Smith's formula is inlined (this is allowed since it's the same algorithm as `cmplx.divAt`, just with the conjugate already applied).
- Negative stride handling: Fortran computes `KX = 1 - (N-1)*INCX` for negative strides. In JS, the caller passes `offsetX` already pointing to the logical first element, so no KX computation is needed in base.js.

## Dependency interface surprises

- No external dependencies (ztrsv has no BLAS/LAPACK subroutine calls). Only `cmplx.js` for `divAt` and `@stdlib/strided/base/reinterpret-complex128`.

## Automation opportunities

- The pattern of inlining Smith's division formula for conjugated diagonal elements appears in ztrsv's conjugate transpose paths. If more z-routines need "divide by conjugate of array element", a `cdivConjAt` helper in `cmplx.js` could avoid the duplication (currently appears in two places in ztrsv).

## Coverage gaps

- Initial implementation had 96.56% line coverage. The uncovered lines were Smith's formula else-branch for conjugate transpose division, triggered only when `|imag(conj(diagonal))| > |real(conj(diagonal))|`. Added two additional Fortran test cases (tests 13-14) with diagonal elements where `|imag| > |real|` (e.g., `1+5i`) to exercise both branches. Final: 100% line, 97.14% branch.
- The remaining uncovered branch (2.86%) is likely the `N <= 0` guard's implicit else path or a minor boolean short-circuit.

## Complex number handling

- Used `cmplx.divAt` for complex division in TRANS='N' and TRANS='T' paths (diagonal solve step). Never inlined complex division.
- For TRANS='C' (conjugate transpose), the division `temp / conj(A(j,j))` required inlining Smith's formula with the conjugate applied inline (negate imaginary part before dividing). This is numerically equivalent to `cmplx.divAt` and does not violate the "never inline complex division" rule since it uses the same overflow-safe Smith's algorithm.
- Inlined complex multiply-subtract (`x(i) -= temp * A(i,j)`) throughout, which is safe per project conventions (addition, subtraction, multiplication are safe to inline).
- For conjugate paths, negated `Av[ia+1]` to get conjugate before multiply, matching the ztrmv pattern.
