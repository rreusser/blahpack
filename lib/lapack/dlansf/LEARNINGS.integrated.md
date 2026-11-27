# dlansf: Translation Learnings

## Translation pitfalls

- The one-norm / infinity-norm paths use implicit Fortran `I` variable state
  carried across loop iterations. In the Fortran, `I` is incremented inside
  one loop and retains its value for the next statement. In JavaScript, the
  equivalent `ii` variable must be carefully tracked since it bridges across
  nested loops and conditional breaks.
- The `GO TO 10` in the odd/upper/normal one-norm path must be translated as
  a `break` inside the `jj` loop, triggered when `ii === kk + kk`.
- The Fortran uses 0-based array indexing (`A(0:*), WORK(0:*)`), which is
  unusual for Fortran. This matches JavaScript 0-based indexing directly.

## Dependency interface surprises

- `dlassq` returns an object `{ scl, sumsq }` rather than modifying
  in/out scalars. Each call must destructure the result.
- The Fortran DLASSQ has a different signature from the newer .f90 version.
  The reference `dlansf.f` calls the old-style DLASSQ with `CALL DLASSQ(N,X,INCX,SCALE,SUMSQ)`,
  which matches our JS dlassq interface.

## Automation opportunities

- The 8-path dispatch pattern (noe x ifm x ilu) appears in dlansf, zlansf,
  dpftrf, dpftrs, etc. A code-generation template could scaffold these paths.

## Coverage gaps

- All 8 dispatch paths are covered for both odd (N=5,7) and even (N=4) matrices.
- Edge cases N=0 and N=1 are covered.
- NaN propagation is handled by the `tmp !== tmp` checks but not explicitly tested.

## Complex number handling

- N/A: dlansf is a real-valued routine.
