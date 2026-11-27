# dlaqsy: Translation Learnings

## Translation pitfalls

- dlaqsy uses single-char uplo ('U'/'L') internally, unlike the long-form convention used by dpotrf/dpotrs etc. The dposvx driver must convert between conventions when calling dlaqsy.
- The `equed` parameter is output-only in Fortran (CHARACTER). In JS, returned as a string from the function rather than modified in place.
- The signature generator shows `equed` as a parameter, but it is purely an output. The base.js returns it as the function's return value (a string), matching the dlaqge pattern.

## Dependency interface surprises

- dlamch is called at module scope for SMALL/LARGE constants, same pattern as dlaqge.

## Automation opportunities

- N/A: mirrors dlaqge closely; straightforward translation.

## Coverage gaps

- 100% line and branch coverage achieved. Both upper and lower triangle paths tested.

## Complex number handling

- N/A: dlaqsy is a real-valued routine.
