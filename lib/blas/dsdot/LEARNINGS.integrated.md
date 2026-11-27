# dsdot: Translation Learnings

## Translation pitfalls

- In Fortran, dsdot operates on single-precision (REAL) arrays with double-precision accumulation. In JavaScript there is no single-precision distinction for Float64Array, so the implementation is identical to ddot.
- The scaffold generator produced an incorrect signature with extra `incx`/`incy` parameters. The correct stdlib-js signature is `dsdot(N, x, strideX, offsetX, y, strideY, offsetY)` matching ddot exactly.

## Dependency interface surprises

- N/A -- no dependencies beyond basic array access.

## Automation opportunities

- The scaffold generator (`init_routine.py`) generated a signature with extra `incx`/`incy` parameters that don't belong in the stride/offset API. The signature generator (`signature.py`) should be the source of truth.

## Coverage gaps

- N/A -- 100% line and branch coverage achieved with 5 test cases (basic, n=0, n=1, stride=2, negative stride).

## Complex number handling

- N/A -- real-valued routine.
