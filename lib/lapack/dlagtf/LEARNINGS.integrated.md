# dlagtf: Translation Learnings

## Translation pitfalls

- IN(N) stores 1-based index of first near-singular diagonal (matches Fortran). Loop variable k is 0-based in JS, so we store `k + 1`.
- The pivot swap path (IN[k]=1) rearranges a, b, c, and d arrays. Must follow exact Fortran operation order -- temp variable for A(K+1) is critical.
- The D array has length N-2, so `k < N - 2` guard applies before accessing D[k].

## Dependency interface surprises

- dlamch('Epsilon') is used for the tolerance floor.

## Automation opportunities

- N/A: straightforward translation.

## Coverage gaps

- The near-singular detection path (piv1/piv2 <= tl) is exercised by the test with lambda=2.0 on a uniform tridiagonal (produces zero diagonal at last element).

## Complex number handling

- N/A: dlagtf is a real-valued routine.
