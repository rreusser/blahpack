# dspr2: Translation Learnings

## Translation pitfalls

- Packed storage indexing: the KK pointer advances by `(j+1)` for upper and `(N-j)` for lower at each outer iteration. This replaces the Fortran `KK = KK + J` and `KK = KK + N - J + 1` patterns (adjusted for 0-based loop variable).
- The Fortran has separate code paths for unit-stride (INCX=1 AND INCY=1) vs general stride. In the JS version with stride/offset API, the general-stride path handles both cases, so only one code path per uplo is needed.
- In the lower-triangle branch, ix/iy start at jx/jy (not offsetX/offsetY) because the inner loop starts at i=j, not i=0.

## Dependency interface surprises

- N/A -- dspr2 has no BLAS/LAPACK dependencies (pure self-contained routine).

## Automation opportunities

- The `fparser` Python dependency is missing from the environment, preventing `bin/signature.py`, `bin/scaffold.py`, and `bin/gen_test.py` from running. The scaffold was pre-generated, but test scaffolding had to be written manually.

## Coverage gaps

- 100% line coverage, 93.3% branch coverage achieved. The uncovered branches are likely the `alpha === 0.0` quick return when `N !== 0` (hard to distinguish from the `N === 0` path in branch analysis). All meaningful code paths are tested.

## Complex number handling

- N/A -- dspr2 is a real-valued routine (d-prefix).
