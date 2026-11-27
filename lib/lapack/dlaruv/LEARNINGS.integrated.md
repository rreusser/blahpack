# dlaruv: Translation Learnings

## Translation pitfalls

- The MM_TABLE (128x4 multiplier table) must be stored in row-major order. Initial attempt stored columns sequentially (column-major), producing wrong random numbers. The correct layout is: each group of 4 consecutive values = one row (corresponding to one DATA statement in Fortran).
- The Fortran uses integer truncation division (`IT3 = IT4 / IPW2`) which must be replicated with `(x / IPW2) | 0` in JS to get integer truncation toward zero.
- The retry loop (GOTO 20) handles the rare case where the random number rounds to exactly 1.0. Translated as a `while(true)` with break.

## Dependency interface surprises

- N/A: dlaruv has no LAPACK dependencies.

## Automation opportunities

- A script was written to extract the MM_TABLE from the Fortran DATA statements. This could be generalized for any large DATA array extraction.

## Coverage gaps

- The retry path (random number rounds to exactly 1.0) is extremely unlikely (~1 in 2^53 calls) and not covered by tests.

## Complex number handling

- N/A: dlaruv is a real-valued routine.
