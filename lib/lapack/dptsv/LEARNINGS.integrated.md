# dptsv: Translation Learnings

## Translation pitfalls

- Trivial driver routine: dptsv is just validation + dpttrf + dpttrs. No index arithmetic needed.
- The Fortran validates LDB >= max(1, N), but in the stride/offset API, LDB is consumed into strideB1/strideB2, so no explicit LDB validation is needed in base.js.
- Quick return: Fortran only checks N < 0 and NRHS < 0. The N=0 and NRHS=0 cases fall through to dpttrf/dpttrs which handle them. We add an explicit early return for N=0 or NRHS=0 to avoid unnecessary function calls.

## Dependency interface surprises

- dpttrf and dpttrs have clean stride/offset APIs that match the expected pattern. No surprises.
- dpttrf returns info (integer), dpttrs also returns info but dptsv only checks dpttrf's return value (dpttrs only fails on invalid args, which dptsv already validated).

## Automation opportunities

- The deps file generator (init_routine.py) missed transitive dependencies (ilaenv, ieeeck, iparmq) needed by dpttrs at Fortran compile time. Had to manually add them. This is a known limitation of the deps analyzer for compile-time dependencies vs runtime JS dependencies.

## Coverage gaps

- 100% line and branch coverage on base.js achieved with 7 tests.
- N/A: all code paths are trivially covered since the routine is a simple driver.

## Complex number handling

- N/A: dptsv is a real (double precision) routine with no complex arithmetic.
