# dormhr: Translation Learnings

## Translation pitfalls

- ILO/IHI are 1-based in the JS API (matching Fortran convention). The submatrix
  pointer arithmetic converts to 0-based internally: A(ILO+1, ILO) in Fortran
  becomes offsetA + ILO*strideA1 + (ILO-1)*strideA2 in JS, and TAU(ILO) becomes
  offsetTAU + (ILO-1)*strideTAU.
- For the left case, C starts at row ILO (0-based), which is Fortran's I1=ILO+1.
  For the right case, C starts at column ILO (0-based), which is Fortran's I2=ILO+1.
  Easy to get confused by the +1 offset between 1-based and 0-based.

## Dependency interface surprises

- dormqr uses long-form string convention: 'left'/'right' and 'no-transpose'/'transpose',
  NOT single-char 'L'/'R'/'N'/'T'. This differs from the CLAUDE.md suggestion that
  base.js uses single chars. The convention is determined by the existing implementation.
- dormqr does not take a `lwork` parameter — it allocates WORK internally if needed.
  The dormhr `lwork` parameter is effectively ignored since we pass WORK through to
  dormqr which handles its own sizing.

## Automation opportunities

- N/A. dormhr is a thin wrapper around dormqr with pointer arithmetic. No mechanical
  steps were repeated.

## Coverage gaps

- 100% line, branch, and function coverage achieved on base.js.
- The small matrix sizes (5x5) only exercise the unblocked path in dormqr (K=4 < NB=32).
  A blocked-path test would need IHI-ILO > 32, requiring a large Hessenberg factorization.
  This is tested at the dormqr level already.

## Complex number handling

- N/A. dormhr is a real (double precision) routine. The complex analog is zunmhr.
