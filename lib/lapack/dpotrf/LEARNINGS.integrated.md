# dpotrf: Translation Learnings

## Translation pitfalls

- [x] The Fortran dpotrf calls ILAENV to determine the block size NB. In JS, NB is hardcoded to 64. For N <= NB (which includes most tests with small matrices), dpotrf delegates entirely to dpotrf2.
- [x] The Fortran code uses 1-based loop `DO J = 1, N, NB` and computes `JB = MIN(NB, N-J+1)`. In 0-based JS: `for (j = 0; j < N; j += NB)` with `jb = Math.min(NB, N - j)`.
- [x] The error info offset when dpotrf2 fails on a diagonal block: Fortran does `INFO = INFO + J - 1` (1-based J). In 0-based JS: `return info + j` since both j and info are already in the right coordinate system (info from dpotrf2 is 1-based within the block).
- [x] The Fortran code has a GOTO 30/40 pattern for error handling. This is restructured as an early return in JS: `if (info !== 0) return info + j`.

## Dependency interface surprises

- [x] dpotrf calls four routines: dpotrf2 (panel factorization), dsyrk (rank-k update of diagonal block), dgemm (off-diagonal update), dtrsm (triangular solve of off-diagonal). The upper and lower paths use different side/trans combinations for each.

## Automation opportunities

- [x] N/A. The blocked algorithm structure is specific to dpotrf.

## Coverage gaps

- [x] 100% line and branch coverage achieved. The blocked path is exercised by using N=80 > NB=64. Small matrix tests (N=3,4) exercise the dpotrf2 delegation path. Not-positive-definite tests exercise the error return path in both the small and large cases.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zpotrf) would use conjugate transpose.
