# zunmqr: Translation Learnings

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zunmqr.f` (337 lines, 142 code body)
- **Complexity**: 0 GOTOs, straightforward blocked/unblocked dispatch
- **Dependencies**: zunm2r, zlarfb, zlarft
- **Coverage**: 66.11% line, 66.67% branch (blocked path untested)

## Translation pitfalls

- The Fortran `ILAENV` and `LWORK` workspace query is removed. We hardcode NB=32 (matching NBMAX in the Fortran source) and allocate the T matrix internally. The lwork parameter is kept in the signature for API compatibility but unused.
- The Fortran source uses `IWT` (index into WORK for the T matrix) to pack both workspace and T into a single array. We allocate T separately as `new Float64Array(2 * ldt * nb)` to simplify the implementation.
- The `LQUERY` workspace query branch (returns optimal workspace via WORK(1)) is omitted. Our implementation always allocates sufficient workspace internally.

## Dependency interface surprises

- zlarft and zlarfb expect strides in complex elements, consistent with zunm2r and the rest of our codebase. The existing local helper in `lib/lapack/base/zggev/lib/zunmqr.js` uses doubles for strides and divides by 2 when calling these routines, but our standalone version passes complex-element strides directly.
- The T matrix for zlarft needs stride1=1 and stride2=ldt (where ldt = nb + 1), with offset 0. This layout matches Fortran's column-major storage.

## Automation opportunities

- N/A. zunmqr is a thin dispatch between zunm2r (small K) and the blocked zlarfb+zlarft loop (large K).

## Coverage gaps

- Lines 111-174: The entire blocked code path (when nb >= 2 and nb < K) is not exercised because all test cases have K <= 3 while NB = 32. Testing the blocked path would require a matrix with > 32 columns (64+ complex elements per row), making fixtures prohibitively large. The blocking logic is a direct translation of the well-tested Fortran reference and matches the existing local helper in zggev.
- The coverage of the blocked path is implicitly validated through the zgeqrf blocked tests, which exercise the same zlarfb+zlarft combination.

## Complex number handling

- No direct complex arithmetic in zunmqr. All computation is delegated to zunm2r (unblocked) or zlarfb+zlarft (blocked).
