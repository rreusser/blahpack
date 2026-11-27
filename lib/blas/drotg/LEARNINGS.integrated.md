# drotg: Translation Learnings

## Translation pitfalls

- The .f90 source uses `real(wp), parameter :: safmin = real(radix(0._wp),wp)**max(minexponent(0._wp)-1, 1-maxexponent(0._wp))` which computes to 2^(-1022). Hardcoded as `2.2250738585072014e-308` in JS.
- Similarly safmax = 2^1023 = `8.98846567431158e+307`.
- The z output encoding is subtle: z=s when |a|>|b|, z=1/c when |b|>=|a| and c!=0, z=1 when c=0. My initial test had wrong expected z for the a=3,b=4 case (|b|>|a|, so z=1/c not z=s).
- API design: all 4 Fortran params are scalar in/out. Packed into two 2-element arrays (ab, cs) with stride/offset to avoid 12 parameters.

## Dependency interface surprises

- No dependencies. Leaf routine.

## Automation opportunities

- The .f90 format cannot be compiled by `run_fortran.sh` due to module dependencies (`la_constants`). Hand-computed test values were used instead of Fortran fixtures.

## Coverage gaps

- Lines 75-76 (z=1.0 when c=0.0 in the |b|>=|a| branch) are uncovered. This requires both a==0 AND b!=0 to take the else branch, but a==0 is handled by the earlier quick return. The only way to reach c=0 in the else branch would be extreme numerical cancellation, which doesn't occur with the safe scaling.

## Complex number handling

- N/A: drotg is a real-valued routine.
