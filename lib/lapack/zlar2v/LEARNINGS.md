# zlar2v: Translation Learnings

## Translation pitfalls

- The Fortran code uses `DBLE(X(IX))` and `DBLE(Y(IX))` to extract only the real part of X and Y, even though they are declared `COMPLEX*16`. The elements are assumed real by the algorithm (diagonal entries of Hermitian matrices). In JS, this means reading only `xv[ix]` (the real part at the Float64 view index) and ignoring `xv[ix+1]`. The imaginary parts of X and Y outputs are explicitly set to 0.0.
- The expression `T4 = DCONJG(T2) + SI*YI` involves conjugating T2 (= ci*zi), so `conj(t2) = (t2r, -t2i)`. Easy to miss the sign flip on the imaginary part.
- The expression `X(IX) = CI*T5 + (SIR*DBLE(T4) + SII*DIMAG(T4))` extracts real/imag parts of T4 and combines with real/imag parts of S to produce a real scalar. This is `real(conj(s) * t4)` = `sir*real(t4) + sii*imag(t4)`. Same pattern for Y with T3.
- The `no-mixed-operators` lint rule required adding parentheses around every product term in additions/subtractions. This is mechanical but affects many lines.

## Dependency interface surprises

- N/A. zlar2v is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The `d-prefix to z-prefix` porting pattern applies well here: dlar2v has real S, zlar2v has complex S. The structural difference is small (complex S means t1/t2/t3/t4 become complex, conjugation appears) but requires careful tracking of real vs imaginary parts.

## Coverage gaps

- 100% line coverage, 85.71% branch coverage achieved. The only uncovered branch is the `y === x` aliasing check in `reinterpret()`, which is a defensive guard for when the same Complex128Array is passed as both x and y. This is not exercised in the test suite because X and Y are always separate arrays in this routine (they hold different diagonal elements of the Hermitian matrix).

## Complex number handling

- All complex arithmetic is inlined since only addition, subtraction, multiplication, conjugate, and real-scalar scaling are needed. No division or absolute value, so no `cmplx.div`/`cmplx.abs` calls were necessary.
- The complex S array uses `reinterpret()` to get Float64 views, with strides doubled (`ss = strideS * 2`) for Float64 indexing. The real C array does not need reinterpret.
- X, Y, Z, S use complex-element strides (the `*2` convention). C uses real strides directly.
