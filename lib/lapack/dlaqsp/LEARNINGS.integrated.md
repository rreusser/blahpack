# dlaqsp: Translation Learnings

## Translation pitfalls

- Packed storage indexing: Upper triangle column j starts at position jc where jc accumulates as jc += j+1. Lower triangle column j starts at jc where jc accumulates as jc += N-j. Both use 0-based indexing in JS vs 1-based in Fortran.
- The Fortran EQUED output parameter becomes a JS return value (string 'none'/'yes' instead of character 'N'/'Y').

## Dependency interface surprises

- No BLAS/LAPACK dependencies. Only dlamch for computing SMALL/LARGE thresholds, which are module-level constants.

## Automation opportunities

- The dlaqsy (full storage) to dlaqsp (packed storage) transformation is mechanical: replace 2D matrix indexing with 1D packed indexing. Could be a transform rule.

## Coverage gaps

- All branches covered: upper/lower, equilibrate/no-equilibrate, N=0, N=1, and larger 4x4 cases.

## Complex number handling

- N/A: dlaqsp is a real-valued routine.
