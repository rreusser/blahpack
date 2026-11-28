# zgbsv: Translation Learnings

## Translation pitfalls

- This is a trivial driver: validate params, call zgbtrf, then zgbtrs. No index arithmetic needed in the driver itself.
- The Fortran LDAB validation (`LDAB >= 2*KL+KU+1`) and LDB validation are handled by zgbtrf/zgbtrs internally; the JS driver delegates validation to the callees (matching dgbsv pattern).
- IPIV is 0-based in JS (consistent with zgbtrf/zgbtrs output). Fixtures from Fortran are 1-based, so tests must subtract 1 when comparing.

## Dependency interface surprises

- zgbtrs expects full string `'no-transpose'` (not `'N'`), matching stdlib-js convention for base.js. This differs from what the Fortran source passes (`'No transpose'`).
- zgbtrf takes `(M, N, ...)` as first two params (not just `N`); for a square system, pass `(N, N, ...)`.
- Both zgbtrf and zgbtrs accept Complex128Array with strides in complex-element units (not Float64 units). The `* 2` conversion to Float64 indexing happens internally.

## Automation opportunities

- The deps.py script did not include `ilaenv`, `ieeeck`, `iparmq` in the deps file (these are needed by zgbtrf for block size queries). Had to manually add them to `test/fortran/deps_zgbsv.txt`. This is a known issue also seen in dgbsv.

## Coverage gaps

- 100% line, branch, and function coverage on base.js. No gaps.
- The driver is trivial (quick return + two function calls), so full coverage is easily achieved with basic test cases.

## Complex number handling

- No complex arithmetic in the driver itself. All complex operations are delegated to zgbtrf and zgbtrs.
- Test arrays created as Complex128Array with interleaved re/im pairs, using reinterpret() for Float64Array views when comparing against fixture data.
