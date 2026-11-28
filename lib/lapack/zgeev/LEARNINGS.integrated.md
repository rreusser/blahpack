# zgeev: Translation Learnings

## Translation pitfalls

- String convention mismatch: BLAS routines (ztrsv, zgemv, etc.) use long-form strings (`'upper'`, `'no-transpose'`, `'non-unit'`), NOT short-form (`'U'`, `'N'`, `'N'`). This caused ztrsv to silently do nothing (fall through all if/else branches), making ztrevc3 produce wrong eigenvectors. Extremely hard to debug since no error is thrown.
- Fortran test fixtures with NMAX > N: when VR/VL arrays have LDVR=NMAX > N, the EQUIVALENCE trick for printing interleaved real arrays gets the wrong column positions. The second column starts at offset NMAX, not N, in memory. Decided to verify eigenvectors mathematically (A*v = lambda*v) rather than comparing fixture values.
- zgebal returns 1-based ilo/ihi (matching Fortran convention), passed through to zgehrd/zhseqr unchanged.

## Dependency interface surprises

- zlatrs: a new dependency, not in existing codebase. Takes Complex128Array for A and x but Float64Array for scale and CNORM. The `scale` parameter is a Float64Array of length 1 (passed by reference).
- ztrevc3: another new dependency. The WORK array stores diagonal elements in positions 0..N-1 and the triangular solve RHS in positions N..2N-1. Must be Complex128Array.
- zgemv: expects `'no-transpose'`, not `'N'`.
- zscal: takes Complex128 scalar (not Complex128Array elements).

## Automation opportunities

- The string convention issue (short vs long form) should be caught by a linting rule or documented more prominently. Every z-prefix routine calling BLAS must use long-form strings.

## Coverage gaps

- 91.45% line, 78.79% branch coverage for zgeev base.js
- Missing coverage: error returns from zhseqr (info > 0), scaling paths (anrm < SMLNUM or anrm > BIGNUM)
- zlatrs: the careful solve path (non-ztrsv path) is only partially tested through ztrevc3; the overflow edge cases are not exercised

## Complex number handling

- Eigenvector normalization uses zscal with conj(v_k)/|v_k| to rotate the largest-magnitude component to be real
- Used reinterpret() at function entry for Float64Array views of Complex128Array inputs
- All Complex128 scalars created with `new Complex128(re, im)` for BLAS calls
- Complex division in zlatrs uses zladiv (never inlined)
