# dlaed5: Translation Learnings

## Translation pitfalls

- `fortran_body.py` stripped out the `C = RHO*Z(1)*Z(1)*DEL` assignment in the W>0 branch, making the stripped output incorrect. Always cross-reference the original `.f` source when the stripped body looks suspicious (missing variable assignments).
- `dlam` is a scalar output (Fortran pass-by-reference). Implemented as `Float64Array(1)` where `dlam[0]` receives the result, consistent with the dlasy2 pattern.
- Hoisted `z1sq`, `z2sq`, `zsq` and pointer variables (`id1`, `id2`, etc.) to avoid repeated index arithmetic and satisfy `no-mixed-operators` lint rule.

## Dependency interface surprises

- N/A: dlaed5 is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The I=1/W<=0/B<=0 branch is hard to trigger. Had to manually solve the system of inequalities to find valid inputs. A future fixture generator for secular equation routines could automate finding inputs that exercise all branches.

## Coverage gaps

- 100% line and branch coverage achieved. All five code paths (I=1 W>0; I=1 W<=0 B>0; I=1 W<=0 B<=0; I=2 B>0; I=2 B<=0) are exercised by the Fortran test fixtures.

## Complex number handling

- N/A: dlaed5 is a real-valued routine.
