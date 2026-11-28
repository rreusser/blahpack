# zlaic1: Translation Learnings

## Translation pitfalls

- JOB parameter maps from Fortran integer (1/2) to descriptive strings
  `'largest-singular-value'` / `'smallest-singular-value'`. No established
  convention existed for this routine (dlaic1 was not yet implemented either).
- The Fortran uses `ABS(GAMMA)` (complex modulus) for comparisons, not
  CABS1. This is `cmplx.abs()` in JS, not the `|re|+|im|` pattern.
- S and C outputs are complex in the Fortran (`COMPLEX*16`), but the JS
  API returns them as `Float64Array(2)` with `[re, im]` layout since there
  is no mutable Complex128 output pattern in stdlib.
- SESTPR is a real scalar output returned via `Float64Array(1)`.

## Dependency interface surprises

- `zdotc` returns a `Complex128` object. Must extract real/imag parts with
  `real()`/`imag()` before doing scalar arithmetic.
- `cmplx.abs()` takes a `Complex128` argument, so when computing the
  absolute value of a (re, im) pair stored in locals, must construct a
  `new Complex128(re, im)` first (only needed in the JOB=2, sest=0 branch).

## Complex number handling

- All complex division in the Fortran is of the form `alpha / realScalar`,
  which is just component-wise real division. No `cmplx.div` was needed
  since the divisors are always real scalars.
- The `SQRT(S*CONJG(S) + C*CONJG(C))` pattern simplifies to
  `sqrt(re^2 + im^2 + ...)` — inlined as real arithmetic since it is
  just computing a norm from known real/imag parts.
- Conjugation appears only in `DCONJG(GAMMA)` and `DCONJG(ALPHA)` in
  the JOB=2 branches — handled by sign-flipping the imaginary part.

## Coverage notes

- 100% line and branch coverage achieved with 22 Fortran test cases
  covering both JOB branches, sest=0, alpha=0, gamma=0, tiny sest,
  small gamma, small alpha, and the normal case sub-branches (b>0/b<=0
  for JOB=1, test>=0/test<0 with b>=0/b<0 for JOB=2).
