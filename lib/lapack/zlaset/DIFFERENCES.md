# zlaset: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/zlaset`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.zlaset.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [STRUCTURAL] Missing `'use strict'` in index.js

- **Ours**: index.js is missing `'use strict';` declaration
- **Stdlib**: has `'use strict';` at top of index.js

## [SIGNATURE] Function Signature Differences

### `zlaset.js` (layout wrapper)
- Signatures match: `zlaset( order, uplo, M, N, alpha, beta, A, LDA )`
- **Ours**: missing `@throws` for LDA validation
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {Complex128Array} A` with `@throws {RangeError}`
- **Stdlib**: has `isColumnMajor` require and LDA >= N validation
- **Stdlib**: has extensive `@example` blocks showing all/upper/lower with Complex128 types
- **Ours**: description "Initializes a complex matrix to BETA on the diagonal and ALPHA on the."
- **Stdlib**: description "Sets the off-diagonal elements and the diagonal elements of a double-precision complex floating-point matrix to specified values."

### `ndarray.js`
- Signatures match: `zlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA )`
- **Ours**: has input validation (imports `format`, `isMatrixTriangle`; throws `TypeError`/`RangeError`)
- **Stdlib**: no input validation -- delegates directly to `base`

### `base.js`
- **Ours**: single monolithic function with if/else branches (632 diff lines!)
- **Stdlib**: five separate functions (`setDiagonal`, `setAll`, `setUpper`, `setLower`, `zlaset`) -- dispatcher pattern
- **Stdlib** helper functions take decomposed real/imaginary components (`areal`, `aimag`, `breal`, `bimag`) rather than Complex128 objects
- The main `zlaset` function in stdlib extracts `real(alpha)`, `imag(alpha)`, `real(beta)`, `imag(beta)` and passes them to helpers
- Both operate on the underlying Float64Array view of Complex128Array

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: no such disable -- separate functions with decomposed scalar args
- **Ours**: `@param {string} uplo - 'upper' or 'lower', otherwise full`
- **Stdlib**: `@param {string} uplo - specifies whether to set the upper or lower triangular/trapezoidal part of matrix A`
- **Ours**: `@param {Complex128} alpha - complex off-diagonal value`
- **Stdlib**: `@param {Complex128} alpha - value assigned to off-diagonal elements`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: examples use pre-filled array and simple scalar args
- **Stdlib**: examples use `Complex128` objects with proper Complex128Array and `.get()` result verification
- **Ours**: `@module` description "Initialize a complex matrix to given values"
- **Stdlib**: `@module` description "LAPACK routine to set the off-diagonal elements..."

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README differences extensive (241 diff lines)
- repl.txt differences substantial (150 diff lines)
- TypeScript type differences (128 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Initialize a complex matrix to given values"`
- **Stdlib**: `"description": "Set the off-diagonal elements and the diagonal elements of a double-precision complex floating-point matrix to specified values."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.zlaset.js`, `test.ndarray.js`

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Differences (27 diff lines)
