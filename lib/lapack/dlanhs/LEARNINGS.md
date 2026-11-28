# dlanhs: Translation Learnings

## Translation pitfalls

- Hessenberg structure means the inner loop limit is `min(N, j+2)` (0-indexed), not just N.
  This matches `min(N, J+1)` in the 1-indexed Fortran. Easy to get wrong with off-by-one.
- The Frobenius norm uses dlassq which returns `{scl, sumsq}` -- must accumulate across columns
  by passing the previous scale/sumsq into each call.

## Dependency interface surprises

- dlassq.f90 uses Fortran modules (`USE la_xisnan`), requiring `la_constants` and `la_xisnan`
  in deps_dlanhs.txt for Fortran test compilation. These are not JS dependencies.
- dlassq returns an object `{scl, sumsq}` rather than modifying in-place scalars.

## Automation opportunities

- None identified -- straightforward translation following zlanhs/dlange patterns.

## Coverage gaps

- All four norm types are covered by Fortran fixtures (3x3 and 4x4 matrices).
- NaN propagation tested for max, one-norm, and inf-norm branches.
- Non-unit strides and offset support tested.
- Frobenius NaN propagation is handled by dlassq internally.

## Complex number handling

- N/A: dlanhs is a real-valued routine.
