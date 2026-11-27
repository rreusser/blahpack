# dgttrf: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dgttrf`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dgttrf.js` -- stdlib has separate test file for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test file for ndarray API
- **Missing** `test/fixtures/` -- stdlib has 8 JSON fixture files (large_positive_stride_1.json, mixed_strides.json, negative_strides.json, etc.)
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Function Signature Differences

### `dgttrf.js` (layout wrapper)
- **Ours**: `dgttrf( N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV )` -- includes stride parameters
- **Stdlib**: `dgttrf( N, DL, D, DU, DU2, IPIV )` -- no stride parameters in layout wrapper (LAPACK-style, unit stride only)
- Stdlib throws `RangeError` if `N < 0`; ours does not validate

### `ndarray.js`
- **Ours**: param `d` (lowercase) for diagonal
- **Stdlib**: param `D` (uppercase) for diagonal
- Stdlib has `format` require and throws `RangeError` for negative `N`; ours has no validation

### `base.js`
- Same parameter signature (both take stride+offset for all arrays)
- **Ours**: uses `Math.abs()`; **Stdlib**: uses `require('@stdlib/math/base/special/abs')`
- **Ours**: param `d` (lowercase); **Stdlib**: param `D` (uppercase)

## [SIGNATURE] Return Value Convention Difference

- **Ours**: returns `i + 1` (1-based INFO, Fortran convention) on singular matrix
- **Stdlib**: returns `i` (0-based index) on singular matrix
- Both return `0` on success

This is a **critical semantic difference** -- our return value for errors follows Fortran 1-based indexing while stdlib uses 0-based JavaScript indexing.

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: uses inline `// eslint-disable-line` comments per line
- **Ours**: base.js missing license header
- **Stdlib**: all files have Apache-2.0 license headers
- **Ours**: `dgttrf.js` / `main.js` / `ndarray.js` missing license headers
- **Stdlib**: all have full license blocks
- **Ours**: JSDoc descriptions are multi-line with Fortran-style language ("elimination with partial pivoting and row interchanges")
- **Stdlib**: JSDoc descriptions use backtick-wrapped math notation ("`LU` factorization")
- **Ours**: parameter descriptions use abbreviated Fortran names ("sub-diagonal elements (length N-1)")
- **Stdlib**: parameter descriptions are more descriptive ("the first sub diagonal of `A`")

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern with `isError` fallback
- **Ours**: `@module` doc has placeholder `// TODO: Add example`
- **Stdlib**: `@module` doc has complete examples for both `.()` and `.ndarray()` interfaces
- **Ours**: missing `'use strict'` context (inherited from main.js pattern)

## [DOCUMENTATION] JSDoc / README

- **Ours**: `@returns {*} result` in layout wrapper
- **Stdlib**: `@returns {integer} status code` with detailed JSDoc examples
- README differences are extensive (417 diff lines); stdlib has full API docs, CLI usage, examples, and links
- repl.txt differences are substantial (253 diff lines)

## [DOCUMENTATION] TypeScript Types

- **Ours**: has `docs/types/index.d.ts` but no `docs/types/test.ts`
- Differences in type declarations (199 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- **Ours**: has `"scripts": { "test": "node --test test/test.js" }`
- **Stdlib**: has `"scripts": {}`, plus `"types"`, `"homepage"`, `"repository"`, `"bugs"`, `"dependencies"`, `"devDependencies"`, `"engines"`, `"os"` fields
- **Ours**: description says "Computes the LU factorization..."
- **Stdlib**: description says "Compute an `LU` factorization..."
- **Stdlib** has `"benchmark"` directory mapping

## [TESTING] Test Structure

- **Ours**: single `test/test.js` using `node:test` framework
- **Stdlib**: three test files: `test.js`, `test.dgttrf.js`, `test.ndarray.js`
- **Stdlib**: uses `tape` test framework
- **Stdlib**: uses JSON fixture files for test data; ours uses inline data
- **Ours**: has `eslint-disable` comment at top of test

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (59 diff lines)
- Examples use different data and calling patterns
