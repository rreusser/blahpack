# zhetd2: Translation Learnings

## Translation pitfalls

- Critical bug: Fortran uses `TAUI` as a local scalar variable, then uses the `TAU` array as workspace for `ZHEMV`. The ZHEMV call clobbers `TAU(1:I)` which includes the current `TAU(I)`. Must save `tauiR`/`tauiI` before calling ZHEMV, then explicitly restore `TAU(I) = TAUI` at the end of each iteration. Failing to do this produced completely wrong reflector coefficients.
- The Hermitian property requires ensuring diagonal elements are real (`Av[ai+1] = 0.0`) at several points: initial A(N,N), after rank-2 update, and after the `else` (tau=0) path.
- The e[] array stores real parts of off-diagonal elements, then those real values are written back to A as the superdiagonal/subdiagonal with zero imaginary parts.

## Dependency interface surprises

- zhemv, zher2, zaxpy, zdotc all needed to be implemented from scratch as the existing stubs were non-functional. Their calling conventions follow the stdlib pattern: Complex128Array with complex-element strides, Complex128 for scalar arguments.
- zdotc returns a Complex128 object (conjugate dot product), not a scalar. Must extract real/imag parts for subsequent complex arithmetic.
- zlarfg writes tau to a Complex128Array at an offset, not returning it as a scalar.

## Automation opportunities

- The "save local taui, use TAU as workspace, restore taui" pattern appears identically in dsytd2 and zhetd2. Could be documented more prominently as a translation checklist item.

## Coverage gaps

- Initial implementation missed the tau=0 (diagonal matrix) branches. Added 3x3 diagonal matrix tests to achieve 100% line and branch coverage.

## Complex number handling

- Used `new Complex128()` for creating scalar arguments to BLAS calls (alpha, beta, taui).
- zdotc result is unpacked via `real()`/`imag()` for manual complex multiplication with taui.
- Complex multiplication of `-0.5 * taui * dot` was inlined (safe: it's a scalar multiply outside any hot loop).
