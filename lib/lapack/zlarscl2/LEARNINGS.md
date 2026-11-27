# zlarscl2: Translation Learnings

## Translation pitfalls

- Straightforward leaf routine -- no index pitfalls. Division of complex by real scalar decomposes to two independent real divisions (re/di, im/di), no complex arithmetic library needed.
- The Fortran fixture file produces NaN values for the divide-by-zero case (D[i]=0). The JSONL fixture parser needed a `NaN` -> `null` replacement before JSON.parse since NaN is not valid JSON. The divide-by-zero test was written with manual assertions (`!isFinite`) instead of fixture comparison.

## Dependency interface surprises

- N/A -- zlarscl2 is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The `gen_test.py` scaffold does not handle NaN in JSONL fixtures. A future improvement would be to auto-detect NaN in fixtures and generate the replacement logic in the test scaffold.
- The audit script `bin/audit.sh` false-positives on `strides` matching `side` when checking for string params. Could be improved with word boundary matching.

## Coverage gaps

- N/A -- 100% line, branch, and function coverage achieved. The routine is simple enough that all paths are exercised by the test suite.

## Complex number handling

- Division by a real scalar is safe to inline: `Xv[ix] /= di; Xv[ix+1] /= di;`. No need for `cmplx.div` since the divisor is real (no complex division stability concerns).
- Used `reinterpret(X, 0)` at function entry to get Float64Array view, then doubled strides/offsets for Float64 indexing. This matches the zlascl2 pattern exactly.
