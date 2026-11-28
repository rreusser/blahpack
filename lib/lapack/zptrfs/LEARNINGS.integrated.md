# zptrfs: Translation Learnings

## Translation pitfalls

- UPLO parameter changes which off-diagonal elements get conjugated in the residual computation. UPLO='U' means E stores superdiagonal (E(i) = A(i,i+1), conj(E(i)) = A(i+1,i)). UPLO='L' is the reverse. Getting the conjugation wrong silently produces incorrect residuals.
- The Fortran CABS1 statement function (|re| + |im|) is used for backward error norms, but ABS (complex modulus sqrt(re^2+im^2)) is used for the final X norm. These must not be confused.
- zpttrf always does L*D*L^H regardless of UPLO. The UPLO parameter only affects zpttrs and zptrfs interpretation of the off-diagonal.

## Dependency interface surprises

- zaxpy takes a Complex128 scalar, not real. Had to create `new Complex128(1.0, 0.0)` for the unit scalar constant.
- zpttrs takes complex-element strides/offsets for E and B, consistent with zpttrf. The WORK array passed as the RHS to zpttrs also uses complex-element strides.

## Automation opportunities

- The residual computation pattern (upper vs lower, with conjugation) is similar across zptrfs/dptrfs and could potentially be a shared helper, but the complex arithmetic makes it different enough that a generic version would be complex.

## Coverage gaps

- Lines 363-364, 395-396 are the large-value RWORK branches in the forward error estimation. These require RWORK values near machine underflow to trigger. Not tested because constructing matrices that produce such small intermediate values is non-trivial.
- 97.5% line, 89.3% branch coverage achieved, exceeding targets.

## Complex number handling

- All complex arithmetic (multiplication, conjugation) is inlined since only addition, subtraction, real-scalar scaling, and multiplication are used. No division or absolute value of complex numbers needed except for CABS1 (which is just |re| + |im|).
- D and DF are real (Float64Array), while E, EF, B, X, WORK are complex (Complex128Array). The `reinterpret()` pattern is used to get Float64 views with doubled strides/offsets.
- The forward error norm estimation uses `ABS(EF(i))` (complex modulus) via inline `Math.sqrt(re^2 + im^2)`, which is safe to inline (no division or underflow concern for unit bidiagonal factors).
