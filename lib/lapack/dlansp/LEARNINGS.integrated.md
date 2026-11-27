# dlansp: Translation Learnings

## Translation pitfalls

- Packed storage indexing is 1D, not 2D. In upper packed format, column j
  stores rows 0..j starting at position j*(j+1)/2. In lower packed format,
  column j stores rows j..N-1 starting at position j*N - j*(j-1)/2.
- Fortran uses 1-based packed index K that advances through the array; the
  JS translation mirrors this with a 0-based `k` counter, which is cleaner
  than computing closed-form packed positions.
- The Frobenius norm diagonal walk uses different strides for upper vs lower:
  upper increments by `i+2`, lower by `N-i`. This matches Fortran's
  `K = K + I + 1` (upper) / `K = K + N - I + 1` (lower) after adjusting
  for 0-based indexing.

## Dependency interface surprises

- `dlassq` returns `{ scl, sumsq }` (not `{ scale, sumsq }`). The property
  name is `scl`, matching Blue's scaling algorithm output convention.
- `dlassq` signature is `(N, x, stride, offset, scale, sumsq)` -- scale and
  sumsq are input parameters, returned updated in the output object.

## Automation opportunities

- The `deps.py` tool does not automatically include `la_constants` and
  `la_xisnan` Fortran modules needed by `dlassq.f90`. These must be manually
  added to `deps_dlansp.txt` for Fortran test compilation.

## Coverage gaps

- The `else` fallback branch (invalid norm string, returns 0.0) is not tested
  because the ndarray wrapper validates inputs. This matches dlansy behavior.
- Lines 173-174 in the Frobenius diagonal loop (`scale >= absa` branch) may
  appear uncovered in some coverage tools but are exercised by multi-element
  diagonal matrices where later diagonals are smaller.

## Complex number handling

- N/A: dlansp is a real-valued routine.
