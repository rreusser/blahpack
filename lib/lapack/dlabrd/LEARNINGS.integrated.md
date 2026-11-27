# dlabrd: Translation Learnings

## Translation pitfalls

- Critical off-by-one in the "Update A(i, i+1:N-1)" section of the upper bidiagonal branch: Fortran `N-I` maps to `N-i-1` (not `N-i`) because I is 1-based and i is 0-based. Two dgemv calls had wrong dimension parameters (`N-i` instead of `N-i-1`). Caught during systematic verification before running tests.
- The key conversion table: `M-I+1` -> `M-i`, `M-I` -> `M-i-1`, `N-I+1` -> `N-i`, `N-I` -> `N-i-1`, `I-1` -> `i`, `I` -> `i+1`. Every single dgemv call must be verified against this table.
- Using zlabrd as a structural template was very effective -- the dgemv call structure is identical, just without zlacgv calls, complex types, or Float64 view indirection.

## Dependency interface surprises

- dlarfg takes alpha as `(array, offset)` -- same as documented in dependency-conventions.md. No new surprises.
- dgemv takes scalar alpha/beta as plain numbers (unlike zgemv which takes Complex128 objects).
- dscal takes scalar da as plain number (unlike zscal which takes Complex128).

## Automation opportunities

- The "real analog of z-routine" pattern (remove complex types, zlacgv calls, reinterpret views, Complex128 scalars) could potentially be automated as a transform if more z->d translations are needed.

## Coverage gaps

- 100% line and branch coverage achieved. All code paths exercised by 6 fixture-based tests plus 2 quick-return edge cases.
- The NB=0 case exercises the loop-not-entered path. M >= N and M < N branches both tested with NB=1 and NB>1.

## Complex number handling

- N/A -- this is a real-valued routine. No complex arithmetic needed.
