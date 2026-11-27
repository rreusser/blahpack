# dpbequ: Translation Learnings

## Translation pitfalls

- Band storage diagonal row is `KD` (0-based) for upper and `0` for lower. The Fortran uses 1-based `J = KD+1` for upper, `J = 1` for lower. Straightforward conversion.
- dpbequ is very similar to dpoequ. The only difference is that diagonal elements come from band storage (`AB(J, I)`) rather than dense storage (`A(I, I)`).
- Object return pattern (`{ info, scond, amax }`) matches dpoequ convention. No surprises.

## Dependency interface surprises

- N/A: dpbequ is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A: The init_routine.py + gen_test.py pipeline worked well for this simple routine.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.
- All code paths covered: quick return (N=0), upper/lower band storage, positive diagonal (scaling), non-positive diagonal at first/middle/last position.

## Complex number handling

- N/A: dpbequ is a real-valued routine.
