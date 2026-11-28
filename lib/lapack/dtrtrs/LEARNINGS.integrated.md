# dtrtrs: Translation Learnings

## Translation pitfalls

- [x] The singularity check loop uses 1-based INFO in Fortran (returns the first zero diagonal index). In JS this translates to `return i + 1` where `i` is 0-based, matching the Fortran convention of 1-based info values.
- [x] The unit diagonal case (`diag='U'`) skips the singularity check entirely, since diagonal values are assumed to be 1 and are never accessed.

## Dependency interface surprises

- [x] dtrtrs is essentially a thin wrapper around dtrsm. The only added value is the singularity check on the diagonal. The dtrsm call uses side='L' (left-side solve) with alpha=1.0.

## Automation opportunities

- [x] N/A. dtrtrs is trivial -- a singularity check followed by a single dtrsm call. No mechanical patterns to extract.

## Coverage gaps

- [x] 100% line and branch coverage achieved. All paths covered: upper/lower, transpose/no-transpose, unit/non-unit diagonal, singular matrix, N=0, multiple RHS.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (ztrtrs) would use conjugate transpose for trans='C'.
