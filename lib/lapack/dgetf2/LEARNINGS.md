# dgetf2: Translation Learnings

## Translation pitfalls

- Straightforward translation; the Fortran is simple (single loop, no GOTO).
- IPIV is 0-based in JS (Fortran is 1-based). idamax returns 0-based, so `jp = j + idamax(...)` directly gives the 0-based global row index.
- INFO remains 1-based: `info = j + 1` when the 0-based loop variable `j` finds a zero pivot.
- dswap swaps entire rows (all N columns), using strideA2 as the step and strideA1 offset to select rows.

## Dependency interface surprises

- No surprises. All deps (idamax, dswap, dscal, dger) have standard stride/offset signatures matching the Fortran call patterns.
- dlamch('safe-minimum') hoisted to module scope as SFMIN constant (per convention).

## Automation opportunities

- The dgetrf2 Fortran test was nearly identical to this one; could template unblocked LU test generation from the same pattern.

## Coverage gaps

- 100% line and branch coverage achieved.
- The sfmin element-by-element division path required a dedicated test case with all-subnormal column values (3e-310, 1e-310, 2e-310) to ensure the max element stays below SFMIN after pivoting.

## Complex number handling

- N/A: dgetf2 is a real-valued routine.
