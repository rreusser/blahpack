# dlarrk: Translation Learnings

## Translation pitfalls

- W and WERR are scalar outputs in Fortran. In JS they use the Float64Array
  output pattern: caller passes `new Float64Array(1)` and the routine writes
  into `w[0]` and `werr[0]`. INFO is returned as the integer return value.
- The Sturm count loop indexes E2 with `i-1` (0-based in JS) while D uses `i`,
  matching the Fortran `DO 20 I = 2, N` loop.
- `dlamch('precision')` (EPS) is hoisted to module scope since it never changes.
- The `itmax` computation uses `|0` (bitwise OR) for the Fortran `INT()` truncation.
- The `for (;;)` infinite loop with break replaces Fortran's `GOTO 10` / `GOTO 30`
  pattern. Two exit conditions: convergence (info=0) and iteration limit exceeded
  (info stays -1).

## Dependency interface surprises

- Only dependency is `dlamch`. No BLAS calls despite being a LAPACK routine.
