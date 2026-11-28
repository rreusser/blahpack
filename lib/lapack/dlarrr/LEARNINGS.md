# dlarrr: Translation Learnings

## Translation pitfalls

- The Fortran source uses `GOTO 11` to break out of a loop when
  `YESREL` becomes false. In JS, this is naturally a `break` statement
  inside the for loop, since the GOTO target (label 11) is immediately
  after the loop.

- The loop in Fortran is `DO 10 I = 2, N` and accesses `E(I-1)`,
  making off-diagonal indexing 0-based relative to the loop start.
  In JS with 0-based arrays: `e[ ie + (i-1)*strideE ]` for loop
  index `i` starting at 1.

## Dependency interface surprises

- `dlamch` is not called at runtime. Constants (`SAFMIN`, `EPS`) are
  hoisted to module scope as numeric literals, matching IEEE 754
  double-precision values from the dlamch lookup table.

- `SMLNUM = SAFMIN / EPS` and `RMIN = sqrt(SMLNUM)` are derived
  constants also hoisted to module scope.
