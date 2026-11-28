# zlatrs: Translation Learnings

## Translation pitfalls

- String convention: must use long-form strings (`'upper'`, `'no-transpose'`, `'non-unit'`) when calling BLAS routines. Short-form causes silent no-op behavior.
- Three transpose modes: `'no-transpose'` (forward solve), `'transpose'` (unconjugated transpose), `'conjugate-transpose'` (Hermitian transpose). The latter two use zdotu and zdotc respectively for the dot product sums.
- The `normin` parameter uses simple `'Y'`/`'N'` strings (not long-form) since it's internal to LAPACK and not a BLAS convention.
- Complex division must use zladiv throughout, never inline. Used scratch arrays ZLADIV_X/Y/OUT at module scope to avoid per-call allocation.

## Dependency interface surprises

- ztrsv: accepts Complex128Array with strides/offsets in complex elements. Uses long-form strings.
- zaxpy: the scalar parameter is Complex128, not a Float64Array pair. Must create `new Complex128(re, im)` for each call.
- zdotc/zdotu: return Complex128 objects, must extract re/im via `real()` and `imag()`.
- dzasum: takes Complex128Array but returns a real scalar.

## Automation opportunities

- The pattern of three nearly-identical code blocks for no-transpose / transpose / conjugate-transpose is very mechanical. A code generator could produce all three from a template.

## Coverage gaps

- Primarily exercises the fast path (ztrsv) through ztrevc3 calls. The careful solve path (overflow prevention with scaling) is only exercised when the growth bound is small.
- The CNORM overflow recomputation path (`tmax > RMAX`) is extremely unlikely in practice and untested.
- The `trans='transpose'` path is never exercised (complex LAPACK only uses `'no-transpose'` and `'conjugate-transpose'`).

## Complex number handling

- cabs1 helper: |re|+|im| used for growth estimation, matching Fortran CABS1 statement function.
- cabs2 helper: |re/2|+|im/2| used for overflow-safe initial estimates.
- Complex division always via zladiv with module-scope scratch arrays.
- Complex multiply-subtract inlined only in computeTransposeSum helper, with comments showing the math.
