# zlapll: Translation Learnings

## Translation pitfalls

- The Fortran saves A11 = X(1) before overwriting X(1) = CONE. The dlas2 call uses ABS(A11), ABS(A12), ABS(A22) which are the saved values, not the current array contents. Must compute complex modulus from saved real/imaginary parts, not from the array positions which have been overwritten.
- The complex multiplication C = -DCONJG(TAU) * dot requires careful expansion: conj(tau) = (tauR, -tauI), then negate gives (-tauR, tauI), then multiply by (dotR, dotI). The parenthesization matters for the no-mixed-operators lint rule.

## Dependency interface surprises

- zlarfg takes tau as a Complex128Array with offset, not a scalar. This matches the dependency-conventions.md documentation.
- zdotc returns a Complex128 object (not array write). Must use real()/imag() to extract parts for subsequent arithmetic.
- zaxpy takes its scalar argument as Complex128 (not array+offset like zlarfg's tau).

## Automation opportunities

- N/A. The init_routine.py scaffold + gen_test.py pipeline worked smoothly for this simple routine.

## Coverage gaps

- N/A. 100% line, branch, and function coverage achieved on base.js. The routine is simple with only one branch (N <= 1 quick return).

## Complex number handling

- Used cmplx.absAt with SCRATCH buffer for computing ABS of saved complex scalars (a11, a12, a22) before passing to dlas2. This avoids inlining complex absolute value per the complex-numbers.md rules, though for this case the naive Math.sqrt(re*re + im*im) would also be safe.
- Inlined the complex multiplication -conj(tau) * dot since multiplication is safe to inline. Expanded as: cR = (-tauR)*dotR - tauI*dotI, cI = (-tauR)*dotI + tauI*dotR.
- Used Complex128 constructor to create the scalar for zaxpy.
