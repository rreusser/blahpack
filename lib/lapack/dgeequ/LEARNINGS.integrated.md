# dgeequ: Translation Learnings

## Translation pitfalls

- ROWCND, COLCND, and AMAX are output scalars in Fortran. Since JS cannot pass scalars by reference, dgeequ returns `{ info, rowcnd, colcnd, amax }`. The caller must destructure the return object.
- INFO values follow 1-based Fortran convention: info=i means the i-th row is zero (1-based); info=M+j means the j-th column (after row scaling) is zero.
- The column scale factors use the already-inverted row scale factors (R) when computing max element per column. This is correct per the Fortran: `C(J) = MAX(C(J), ABS(A(I,J))*R(I))`.

## Dependency interface surprises

- N/A: dgeequ only depends on dlamch, which is a simple constant query.

## Automation opportunities

- Routines with multiple scalar outputs (like dgeequ returning rowcnd, colcnd, amax alongside info) consistently use the `{ info, ... }` object return pattern. This is now well-established.

## Coverage gaps

- 100% line and branch coverage achieved. Tests cover: basic matrix, diagonal matrix with varied scales, zero row, zero column, identity, quick returns (M=0, N=0), and non-square matrix.

## Complex number handling

- N/A: dgeequ is a real-valued routine.
