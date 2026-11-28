# dppsvx: Translation Learnings

## Translation pitfalls

- The `equed` parameter is passed as a single-element array (`[ 'none' ]` or `[ 'yes' ]`) because it is both an input and output parameter. On input for `fact='factored'`, it indicates whether the system was previously equilibrated. On output for `fact='not-factored'` or `fact='equilibrate'`, it indicates whether equilibration was applied.
- The Fortran `EQUED` character parameter maps to `'none'`/`'yes'` strings (not `'N'`/`'Y'`).
- The `FACT` parameter maps to `'not-factored'`, `'factored'`, or `'equilibrate'` (corresponding to Fortran `'N'`, `'F'`, `'E'`).
- When `rcequ` is true and `fact='factored'`, SCOND must be computed from the S array inline to match Fortran behavior.

## Dependency interface surprises

- `dppequ` returns an object `{ info, scond, amax }` rather than using output parameters for `scond` and `amax`.
- `dlaqsp` returns the equilibration string (`'none'` or `'yes'`) rather than writing to a parameter.
- Unlike `dspsvx` (symmetric indefinite), this routine has no `IPIV` parameter since positive definite matrices use Cholesky factorization.

## Automation opportunities

- The `equed` array wrapper pattern (single-element array for in/out string params) appears in multiple expert driver routines and could be standardized.

## Coverage gaps

- When `fact='equilibrate'` and the matrix is well-conditioned (as in our test matrices), `dlaqsp` returns `'none'` and no actual equilibration occurs. The equilibration scaling path was tested via `fact='factored'` with `equed='yes'`.

## Complex number handling

- N/A: dppsvx is a real-valued routine.
