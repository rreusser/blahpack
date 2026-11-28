# dlagtm: Translation Learnings

## Translation pitfalls

- The Fortran has 4 near-identical code blocks for alpha=1/N, alpha=1/T, alpha=-1/N, alpha=-1/T. Keeping all four separate preserves the Fortran operation order and avoids combining alpha*sign into expressions.
- For N=1, only the diagonal applies (no sub/super-diagonal). This is handled in each branch but easy to overlook.
- In the transpose case, the roles of DL and DU are swapped relative to no-transpose. For A^T, row i gets DU[i-1] from above and DL[i] from below.

## Dependency interface surprises

- N/A: dlagtm is a leaf routine with no LAPACK dependencies.

## Automation opportunities

- N/A: straightforward translation.

## Coverage gaps

- Only the alpha=0 path (no multiplication) is not covered, since it's a no-op. 98.82% line coverage.

## Complex number handling

- N/A: dlagtm is a real-valued routine.
