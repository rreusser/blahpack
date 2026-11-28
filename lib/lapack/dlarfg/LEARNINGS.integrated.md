# dlarfg: Translation Learnings

## Translation pitfalls

- [x] The GOTO in the original Fortran (label 10 for rescaling loop) translates naturally to a do-while loop.
- [x] Fortran SIGN(A,B) returns |A|*sign(B). When B=0, Fortran returns +|A|. JS Math.sign(0)=0, so we use `(Math.sign(x) || 1.0)` to handle the alpha=0 case.
- [x] Alpha is passed as a 1-element array (alpha, offsetAlpha) so it can be modified in-place, matching the Fortran in/out semantics.
- [x] The real version is much simpler than zlarfg: no complex division, no conjugation, tau is a single scalar.

## Dependency interface surprises

- [x] Uses dnrm2 (real norm, not dznrm2), dscal (real scale), dlamch (machine constants), dlapy2 (safe hypotenuse).
- [x] dlapy2 was not previously implemented -- it's a simple overflow-safe sqrt(x^2+y^2) function.

## Automation opportunities

- [x] The rescaling loop pattern (scale until |beta| >= safmin) is identical between dlarfg and zlarfg. Could be shared.

## Coverage gaps

- [x] All paths covered: basic, alpha=0, n=1 (trivial), x=0 (identity), negative alpha, n=0. The rescaling path (|beta| < safmin) is not covered as it requires extremely small inputs near underflow threshold.

## Complex number handling

- [x] N/A. Real-valued. No complex division or conjugation needed. The complex zlarfg uses cmplx.div for ZLADIV.
