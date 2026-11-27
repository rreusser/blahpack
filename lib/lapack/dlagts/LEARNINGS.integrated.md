# dlagts: Translation Learnings

## Translation pitfalls

- Fortran `SIGN(TOL, AK)` must be `Math.abs(tol) * ((ak >= 0.0) ? 1.0 : -1.0)`. Note: Math.sign(0) returns 0, not +1, so the ternary is used instead.
- The TOL parameter is modified in-place in Fortran when JOB < 0 and TOL <= 0. In JS, since scalars are by value, the modified tol is only used locally within the function. This is fine because dstein (the caller) passes a tol variable that was already set by dlagtf.
- The perturbation loop (GOTO 40/70) is a `while(true)` loop that doubles the perturbation until the diagonal element is large enough.
- Four main code paths: JOB=1/-1 (forward solve) and JOB=2/-2 (transpose solve), each with and without perturbation.

## Dependency interface surprises

- dlagts expects the factorization produced by dlagtf: A=diagonal of U, B=super-diagonal of U, C=sub-diagonal of L, D=second super-diagonal of U, IN=pivot info.

## Automation opportunities

- The four JOB paths share significant structure. A template could reduce code duplication.

## Coverage gaps

- JOB=1 and JOB=2 (without perturbation) paths are not tested -- only JOB=-1 and JOB=-2 are tested because dstein always uses JOB=-1.
- The overflow detection path (INFO > 0) is not tested.
- The SFMIN rescaling path is not tested.

## Complex number handling

- N/A: dlagts is a real-valued routine.
