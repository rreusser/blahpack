# zpbsv: Translation Learnings

## Translation pitfalls

- Direct mirror of dpbsv. No index or stride issues since the routine is purely a thin wrapper around zpbtrf + zpbtrs.
- The uplo parameter is passed through as-is to zpbtrf/zpbtrs which expect long-form strings ('upper'/'lower').

## Dependency interface surprises

- zpbtrf and zpbtrs both use complex-element strides/offsets (not float64-based), consistent with their documented API. No surprises.

## Automation opportunities

- N/A. This is a trivial two-call wrapper.

## Coverage gaps

- N/A. 100% line, branch, and function coverage on base.js achieved with 10 test cases covering upper/lower, tridiagonal/pentadiagonal, N=0/1, NRHS=0/1/2, and not-positive-definite cases.

## Complex number handling

- No complex arithmetic in zpbsv itself. All complex work is delegated to zpbtrf and zpbtrs.
- Fortran test uses EQUIVALENCE to print interleaved re/im pairs for fixture comparison.
