# dgtsvx: Translation Learnings

## Translation pitfalls

- **RCOND is an output scalar**: In Fortran, RCOND is a DOUBLE PRECISION output. In JS, it must be passed as a Float64Array of length 1 so that dgtcon can write to rcond[0]. This is consistent with dgtcon's interface.
- **FACT parameter mapping**: Fortran 'N'/'F' maps to 'not-factored'/'factored' in long-form. Easy to confuse with the TRANS parameter strings.
- **N=0 quick return**: Unlike many routines, dgtsvx does NOT have an explicit N=0 quick return. The logic flows through to dlangt (returns 0), dgtcon (returns rcond=1), dlacpy (no-op), dgttrs (no-op), dgtrfs (quick return). This works correctly without special-casing.

## Dependency interface surprises

- dgtcon takes norm as 'one-norm'/'infinity-norm' (long-form), matching the string convention.
- dlangt also uses long-form norm strings.
- The NORM selection depends on TRANS: 'one-norm' for no-transpose, 'infinity-norm' for transpose/conjugate-transpose. This matches the Fortran where NORM='1' for NOTRAN and NORM='I' otherwise.

## Automation opportunities

- N/A: dgtsvx is a thin driver routine that orchestrates calls to dgttrf, dlangt, dgtcon, dlacpy, dgttrs, dgtrfs. Very little logic to automate.

## Coverage gaps

- The nofact=false (fact='factored') path that skips dgttrf is covered by test 2 (fact_f_trans_n). 98.94% line coverage; the uncovered lines are the N<0/NRHS<0 validation paths (not implemented in base.js per convention).

## Complex number handling

- N/A: dgtsvx is a real-valued routine.
