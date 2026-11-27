# zgesv: Translation Learnings

## Translation pitfalls

- Trivial driver routine: just calls zgetrf + zgetrs. No index arithmetic needed.
- zgetrs expects `'no-transpose'` (long-form string), not `'N'`. Matched dgesv pattern.

## Dependency interface surprises

- zgetrf and zgetrs use Complex128Array with complex-element strides (1, N for col-major), same as dgesv uses Float64Array with element strides. No conversion needed at the driver level.
- IPIV from zgetrf is 0-based (JS convention), same as dgetrf.

## Automation opportunities

- The scaffold generator (init_routine.py) correctly produced a working base.js from the dgesv template. No manual edits to base.js were needed.
- Test scaffold required manual fill-in of Complex128Array inputs and reinterpret() calls. Could potentially automate complex test input generation from Fortran source.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- Singular matrix test only checks info > 0 (exact value depends on pivot order, which may differ between Fortran 1-based and JS 0-based IPIV).

## Complex number handling

- No complex arithmetic in this driver; all complex work is delegated to zgetrf/zgetrs.
- Tests use Complex128Array for inputs and reinterpret() to get Float64 views for comparison against JSONL fixtures (which store interleaved re/im doubles).
