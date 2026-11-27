# dlangb: Translation Learnings

## Translation pitfalls

- The Fortran loop bounds use 1-indexed MAX/MIN. In 0-indexed JS, the band
  row loop for max/one-norm is `i = max(KU+1-j,1)-1` to `i < min(N+KU-j, KL+KU+1)`,
  directly matching the zlangb complex counterpart but with `Math.abs` instead
  of complex modulus.
- The infinity-norm inner loop uses a different indexing scheme (iterating over
  actual matrix rows i, with `k = KU - j` as the band-row offset), not the
  same loop bounds as max/one-norm. This matches the Fortran exactly.

## Dependency interface surprises

- dlassq returns `{ scl, sumsq }` (not `{ scale, sum }`). Must use `.scl`
  and `.sumsq` to read the returned values.

## Automation opportunities

- dlangb is a direct simplification of zlangb (drop reinterpret, drop cmplx,
  use Math.abs). A codemod could derive d* norm routines from z* by stripping
  complex handling.

## Coverage gaps

- NaN propagation is tested implicitly through the `value < temp || temp !== temp`
  pattern but no explicit NaN fixture was generated. The Fortran DISNAN check
  is faithfully translated.

## Complex number handling

- N/A: dlangb is a real-valued routine.
