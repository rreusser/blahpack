# zher2: Translation Learnings

## Translation pitfalls

- The Fortran uses `TEMP1 = ALPHA*DCONJG(Y(JY))` and `TEMP2 = DCONJG(ALPHA*X(JX))`. These are NOT the same thing: temp1 = alpha*conj(y) while temp2 = conj(alpha*x) = conj(alpha)*conj(x). Getting the conjugation order right is critical.
- Diagonal update must produce a real result. Fortran uses `DBLE(A(J,J)) + DBLE(X(J)*TEMP1+Y(J)*TEMP2)`. In JS, this means setting the imaginary part to 0.0 after adding only the real part of the rank-2 update term.
- Even when x[j]=0 and y[j]=0 (skip branch), the diagonal imaginary part must still be forced to 0.0. This is because the input matrix might have non-zero imaginary diagonal from previous operations or initialization.
- The lower-triangle zero-element skip branch (lines 161-165) was initially uncovered. Added a dedicated test with UPLO='L' and zero first elements to cover it.

## Dependency interface surprises

- N/A — zher2 has no BLAS/LAPACK dependencies beyond LSAME and XERBLA.

## Automation opportunities

- Same as zhemv: Fortran-to-JS test data translation is mechanical and error-prone. The column-major index mapping and complex-interleaved format conversion could be automated.
- The zhemv and zher2 implementations share structural patterns (reinterpret, stride*2, uplo branching, diagonal-is-real handling). A template for Hermitian BLAS routines would reduce boilerplate.

## Coverage gaps

- No gaps: 100% line, 100% branch, 100% function coverage achieved after adding the lower_zeros test case.
- All paths covered: N=0, alpha=0, upper+lower triangles, unit+non-unit strides, complex alpha, zero-element skip (both upper and lower), 3x3 matrix.

## Complex number handling

- All complex arithmetic inlined: multiplication, conjugation, real-part extraction. No cmplx.div or cmplx.abs needed.
- `temp1 = alpha*conj(y[j])`: computed as `(aR*yR + aI*yI) + i(-aR*yI + aI*yR)` — conjugate flips y's imaginary sign before multiply.
- `temp2 = conj(alpha*x[j])`: first compute `alpha*x[j] = (aR*xR - aI*xI) + i(aR*xI + aI*xR)`, then negate imaginary for conjugate.
- Diagonal real-part extraction: after computing `x[j]*temp1 + y[j]*temp2`, only the real part is added to `Av[ai]`, and `Av[ai+1]` is set to 0.0.
- Followed the zgemv/zhemv pattern for Float64Array views and stride/offset doubling.
