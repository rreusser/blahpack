# zgbsvx: Translation Learnings

## Translation pitfalls

- Band storage copy (AB to AFB): Fortran loop uses `ZCOPY(J2-J1+1, AB(KU+1-J+J1, J), 1, AFB(KL+KU+1-J+J1, J), 1)`. The key insight is that the destination (AFB) has an extra KL rows for fill-in, so the band row offset shifts by KL.
- RPVGRW singular path: When factorization fails (info > 0), ZLANTB is called with a non-zero offset into AFB (`MAX(1, KL+KU+2-INFO)`) and `MIN(INFO-1, KL+KU)` superdiagonals. Both the offset and bandwidth must be computed correctly for the truncated triangular factor.
- The ANORM for the singular path scans only the first INFO columns of AB (not all N columns), matching Fortran loops exactly.

## Dependency interface surprises

- zgbcon takes rcond as a Float64Array(1) output parameter, not a scalar return value. Must allocate `new Float64Array(1)` and read `RCOND[0]` after the call.
- zgbequ returns an object `{ info, rowcnd, colcnd, amax }` — need to check `eq.info === 0` before proceeding with equilibration.
- zlaqgb returns a string ('none', 'row', 'column', 'both') directly, not via an output parameter.

## Automation opportunities

- The denseToGB helper in tests could be a shared utility since multiple gb* routines need it.

## Coverage gaps

- Fully banded matrices with KL > 1 and KU > 1 not tested (only tridiagonal KL=KU=1).
- RPVGRW singular path tested via the singular matrix test case.

## Complex number handling

- Complex scaling of B and X uses reinterpret(Complex128Array) to get Float64 views, then scales real and imaginary parts separately (same pattern as zgesvx).
- No inline complex arithmetic needed — all complex operations handled by dependency routines (zcopy, zlacpy, zgbtrf, zgbtrs, zgbrfs, zgbcon).
