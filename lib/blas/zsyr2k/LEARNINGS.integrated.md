# zsyr2k: Translation Learnings

## Translation pitfalls

- Complex beta vs real beta: The biggest difference from zher2k is that zsyr2k has a complex beta scalar, not real. This affects every beta-scaling branch -- you must do a full complex multiply `(betaR*cR - betaI*cI, betaR*cI + betaI*cR)` instead of just `beta * c`. The quick-return condition must check `betaR === 1.0 && betaI === 0.0` instead of just `beta === 1.0`.
- No conjugation anywhere: Unlike zher2k which uses conj(B), conj(alpha), and forces diagonal real, zsyr2k uses plain transpose everywhere and both update terms use alpha (not conj(alpha)). Diagonal elements stay fully complex.
- Aliasing in complex beta multiply (transpose path): When computing `C[i,j] = beta*C[i,j] + update`, the beta multiply must save both real and imaginary parts of C[i,j] before overwriting. Line `Cv[ic] = betaR*Cv[ic] - betaI*Cv[ic+1]` clobbers Cv[ic] before the next line reads it. Fixed by saving to temporaries first.
- Fortran test initial C setup: When mapping Fortran 1-based array indices to JS 0-based Complex128Array, column-major layout means c(4) in a 3x3 matrix is row 0, col 1 (not row 1, col 0). Got this wrong on first attempt for the complex_alpha_beta test case.

## Dependency interface surprises

- N/A -- zsyr2k is a leaf BLAS routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A -- existing scaffold and gen_test tooling worked well.

## Coverage gaps

- All branches covered (100% line, 88.41% branch). The uncovered branches are the implicit fall-through when `beta === (1,0)` in the no-transpose path (the "do nothing" case when beta is identity).

## Complex number handling

- Both alpha and beta are Complex128 scalars, extracted via `real()` and `imag()` at function entry.
- All complex multiplies are inlined (safe: no division or absolute value).
- The `reinterpret()` pattern with stride*2 and offset*2 conversion works identically to zher2k.
