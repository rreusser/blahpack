# dlarrc: Translation Learnings

## Translation pitfalls

- JOBT parameter maps to `'tridiagonal'` (Fortran `'T'`) and `'ldl'` (Fortran `'L'`). These are non-standard long-form strings since JOBT is not one of the standard parameter types (uplo, trans, side, etc.). The ndarray.js wrapper includes explicit whitelist validation for these two values.
- The routine returns multiple scalar outputs (eigcnt, lcnt, rcnt) plus info. These are output-only params, so they are returned as an object `{ info, eigcnt, lcnt, rcnt }` rather than passed as mutable parameters.
- The signature generator listed eigcnt/lcnt/rcnt as input parameters, but they are pure outputs in Fortran. Had to manually adjust the signature to return an object instead.

## Dependency interface surprises

- N/A: dlarrc is a leaf routine with no JS dependencies. It only calls LSAME in Fortran, which is replaced by string comparison in JS.

## Automation opportunities

- The signature generator (`bin/signature.py`) does not distinguish output-only scalar params from input params. For routines with multiple scalar outputs (like eigcnt, lcnt, rcnt), it lists them as params when they should be part of a return object. A heuristic based on the Fortran intent(out) annotation could automate this.

## Coverage gaps

- Lines 117-118 (final lpivot<=0 check in LDL^T branch after the main loop) were not covered because no test produced a negative final pivot. This is at 98.53% line coverage which exceeds the threshold. A targeted test with a sufficiently negative last diagonal element would cover it.

## Complex number handling

- N/A: dlarrc is a real-valued routine.
