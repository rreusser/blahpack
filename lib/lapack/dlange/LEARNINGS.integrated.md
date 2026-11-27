# dlange: Translation Learnings

## Translation pitfalls

- Straightforward translation from Fortran. No index pitfalls since dlange only reads matrix elements and does reductions.
- The NaN propagation pattern `value < temp || temp !== temp` maps directly from the Fortran `VALUE.LT.TEMP .OR. DISNAN(TEMP)` idiom and is critical for correctness.
- dlange is a FUNCTION (returns a scalar), not a SUBROUTINE. The return value is the norm, not INFO.

## Dependency interface surprises

- dlassq returns `{ scl, sumsq }` object (not modifying parameters in-place as Fortran does). The property is `scl` not `scale` to avoid shadowing.
- dlassq takes real Float64Array directly with stride/offset, unlike zlassq which takes Complex128Array with complex-element strides.
- For the Frobenius norm, dlassq is called per-column. The column offset is `offsetA + j * strideA2`, and `strideA1` is passed as the stride within each column.

## Automation opportunities

- This translation was nearly identical to zlange minus the complex arithmetic. A templating approach (real vs complex variant) could generate both from a single template.

## Coverage gaps

- 100% line and branch coverage on base.js achieved.
- The dlassq Blue's scaling paths (big/small accumulators) are not exercised by dlange's tests, but those are dlassq's responsibility.

## Complex number handling

- N/A: dlange is the real-valued analog. No complex arithmetic needed. Uses `Math.abs()` instead of `cmplx.absAt()`.
