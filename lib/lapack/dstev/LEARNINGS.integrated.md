# dstev: Translation Learnings

## Translation pitfalls

- N/A: dstev is a thin wrapper that delegates all computation to dsterf/dsteqr. No index arithmetic of its own.

## Dependency interface surprises

- `dsteqr` uses string convention `'initialize'`/`'update'`/`'none'` instead of Fortran's `'I'`/`'V'`/`'N'`. The Fortran `LSAME(COMPZ,'I')` is translated to `compz === 'initialize'` in the JS implementation. This caused the initial test failure (info=-1) until corrected.
- `dlanst` signature: `dlanst(norm, N, d, strideD, offsetD, e, strideE, offsetE)` -- takes the norm type as first arg, same as Fortran.

## Automation opportunities

- The `JOBZ` string convention mismatch (Fortran single-char vs JS full-word) should be documented in `docs/dependency-conventions.md` for dsteqr. This is a recurring pattern across all callers of dsteqr.

## Coverage gaps

- Lines 84-85, 87-89, 91-93, 105-111: scaling paths that trigger when `tnrm` is near underflow (`< RMIN`) or overflow (`> RMAX`) thresholds. Would require constructing matrices with elements near `1e-154` or `1e+154`. Coverage is 87.39% line, 70.59% branch -- acceptable for a driver routine.

## Complex number handling

- N/A: dstev is a real-valued routine.
