# zptsv: Translation Learnings

## Translation pitfalls

- Trivial driver routine: zptsv just calls zpttrf then zpttrs. No index arithmetic needed in this file.
- The Fortran calls `ZPTTRS('Lower', ...)`, which maps to `zpttrs('L', ...)` in JS. The uplo parameter determines whether the factorization is L*D*L^H or U^H*D*U.

## Dependency interface surprises

- zpttrs takes an `uplo` parameter as first argument, which zptsv hardcodes to `'L'` (matching the Fortran `'Lower'`).
- The deps file needed ilaenv, ieeeck, and iparmq for Fortran compilation (zpttrs calls ilaenv), but these are not needed in JS since block size is hardcoded.

## Automation opportunities

- The `init_routine.py` deps file generator missed transitive LAPACK utility deps (ilaenv/ieeeck/iparmq) needed for Fortran compilation. The JS side doesn't need them since ilaenv is replaced with hardcoded constants, but the Fortran deps file does.

## Coverage gaps

- 100% line and branch coverage on base.js. All code paths (quick return for N=0, nrhs=0, factorization failure, successful solve) are covered.

## Complex number handling

- D is Float64Array (real diagonal), E and B are Complex128Array. No complex arithmetic happens in zptsv itself; it delegates entirely to zpttrf and zpttrs.
- Strides/offsets for E and B are in complex elements (not doubles).
