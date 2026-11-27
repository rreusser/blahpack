# dlacpy: Learnings from stdlib comparison

## Structural differences in base.js

1. **Helper function decomposition**: stdlib splits into `copyAll`, `copyUpper`, `copyLower` as private functions, with `dlacpy` dispatching. We used a single function with if/else. The decomposition pattern appears standard for routines with uplo dispatch.

2. **Loop interchange optimization**: `copyAll` uses `@stdlib/ndarray/base/unary-loop-interchange-order` to reorder iteration for cache efficiency based on stride patterns. We iterate in naive order. This is a performance enhancement.

3. **Row-major detection**: `copyUpper`/`copyLower` use `isRowMajor([strideA1, strideA2])` and iterate differently for row vs column major. We handle both via stride arithmetic (correct, but less cache-efficient).

4. **UPLO string values**: base.js uses full strings (`'upper'`, `'lower'`, `'all'`), NOT Fortran chars (`'U'`, `'L'`). The ndarray.js wrapper normalizes.

## Scaffold differences

5. **eslint-disable pragmas**: stdlib adds `/* eslint-disable max-len, max-params */` at top of base.js and `// eslint-disable-line max-len, max-params` on long function signatures.

6. **JSDoc @example blocks**: stdlib has extensive examples on every private function, covering all 8 stride permutations (+/- for each of 2 dimensions × 2 orderings). These are very thorough.

7. **@param types**: stdlib uses specific types: `{string}`, `{NonNegativeInteger}`, `{Float64Array}`, `{integer}`. Our scaffold uses `{TODO}`.

8. **ndarray.js is a thin passthrough**: In stdlib, ndarray.js for dlacpy has no validation — just calls base directly. The validation lives in `dlacpy.js` (the BLAS/LAPACK-style wrapper).

## Actionable items for tooling

- [x] Scaffold should add eslint-disable pragmas for long signatures — DONE in scaffold.py
- [x] Scaffold should generate proper @param types — DONE via signature.py js_arg_meta
- [ ] Document the helper decomposition pattern in CLAUDE.md for uplo routines
- [x] uplo string convention decided: single chars in base.js, ndarray.js normalizes — documented in CLAUDE.md
- [x] Loop interchange optimization deferred — correctness first, noted in CLAUDE.md
