# dgesc2: Translation Learnings

## Translation pitfalls

- Fortran uses DLASWP on the RHS vector (treated as Nx1 matrix). In JS, implemented row permutations directly with element swaps instead of calling dlaswp on a vector, which is simpler.
- The column permutation (JPIV) is applied in REVERSE order (i = N-2 down to 0), matching Fortran's `CALL DLASWP( 1, RHS, LDA, 1, N-1, JPIV, -1 )`.
- The `scale` output parameter is a Float64Array with `scale[0]`.

## Dependency interface surprises

- idamax returns 0-based index in JS (vs 1-based in Fortran). Used directly without adjustment.

## Automation opportunities

- N/A for this leaf routine.

## Coverage gaps

- The scaling path (where 2*SMLNUM*|RHS(i)| > |A(N,N)|) requires carefully constructed near-overflow inputs. Not explicitly tested but the path is straightforward.

## Complex number handling

- N/A: dgesc2 is a real-valued routine.
