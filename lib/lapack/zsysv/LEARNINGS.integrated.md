# zsysv: Translation Learnings

## Translation pitfalls

- Simple driver routine: zsysv is just zsytrf + zsytrs2, so the translation is straightforward. No loop or index logic to get wrong.
- The Fortran source has a LWORK < N branch that falls back to zsytrs (BLAS-2 solve) instead of zsytrs2 (BLAS-3 solve). In the JS base.js, we always allocate sufficient workspace and use zsytrs2 for best performance. The LWORK parameter and workspace query logic are omitted since workspace is allocated internally.

## Dependency interface surprises

- **zsytrf uses 'upper'/'lower' string convention** (not 'U'/'L'). The base.js must map the single-char uplo ('U'/'L') to the full string before calling zsytrf. This matches the pattern from dsysv.
- **zsytrs2 uses 'U'/'L' single-char convention**. So the single-char uplo is passed directly to zsytrs2 without mapping.
- **zsytrf has a bug with 2x2 pivots in the upper-triangle path** when diagonal elements are exactly zero. The Fortran reference ZSYTRF handles this correctly (returns info=0 with negative IPIV entries), but the JS zsytrf returns info>0. This affects the `pivot_2x2_upper` test case. The lower-triangle 2x2 pivot path works correctly. This is a pre-existing bug in zsytrf, not introduced by zsysv.

## Automation opportunities

- N/A. The simple driver pattern (validate, call factorize, call solve, return info) could be templated for future dsysv/zsysv/chesv/zhesv drivers, but there are few enough variants that it's not worth automating.

## Coverage gaps

- 100% line, branch, and function coverage on base.js.
- The `pivot_2x2_upper` Fortran test case (zero-diagonal matrix forcing 2x2 pivots in upper mode) could not be verified in JS due to the zsytrf bug noted above. The lower-triangle 2x2 pivot case works and is tested.

## Complex number handling

- zsysv itself performs no complex arithmetic -- it delegates entirely to zsytrf and zsytrs2. The Complex128Array workspace for zsytrs2 is allocated internally as `new Complex128Array(N)`.
- Input arrays A and B are Complex128Array. IPIV is Int32Array with 0-based indexing convention.
