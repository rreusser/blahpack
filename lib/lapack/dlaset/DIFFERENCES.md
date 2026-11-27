# dlaset: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dlaset`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dlaset.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/fixtures/` -- stdlib has 24 JSON fixture files across directories (all, upper, lower for row/col major, plus large_strides, mixed_strides, negative_strides, offsets subdirectories)
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Function Signature Differences

### `dlaset.js` (layout wrapper)
- Signatures match: `dlaset( order, uplo, M, N, alpha, beta, A, LDA )`
- **Ours**: missing `@throws` for LDA validation
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {Float64Array} A` with `@throws {RangeError}`
- **Stdlib**: has `isColumnMajor` require and LDA >= N validation
- **Stdlib**: has three `@example` blocks (all, upper, lower); ours has none

### `ndarray.js`
- Signatures match: `dlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA )`
- **Ours**: has input validation (imports `format`, `isMatrixTriangle`; throws `TypeError`/`RangeError`)
- **Stdlib**: no input validation -- delegates directly to `base`

### `base.js`
- **Ours**: single monolithic function with if/else branches for uplo
- **Stdlib**: five separate functions (`setDiagonal`, `setAll`, `setUpper`, `setLower`, `dlaset`) -- dispatcher pattern
- Both have the same parameter signature for the main entry point

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: no disable -- separate functions keep each short
- **Ours**: `@param {string} uplo - 'upper' or 'lower', otherwise full matrix`
- **Stdlib**: `@param {string} uplo - specifies whether to set the upper or lower triangular/trapezoidal part of matrix A`
- **Ours**: `@param {number} alpha - off-diagonal value`; **Stdlib**: `@param {number} alpha - value assigned to off-diagonal elements`
- **Ours**: `@param {PositiveInteger} LDA - leading dimension of A`; **Stdlib**: `@param {PositiveInteger} LDA - stride of the first dimension of A (a.k.a., leading dimension of the matrix A)`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: examples use `A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] )` (pre-filled)
- **Stdlib**: examples use `A = new Float64Array( 4 )` (zero-initialized, shows result)
- **Ours**: ndarray example uses `dlaset.ndarray( 'upper', 2, 2, 1.0, 0.0, A, 1, 2, 0 )` -- strides in (s1=1, s2=2) order suggesting column-major
- **Stdlib**: ndarray example uses `dlaset.ndarray( 'all', 2, 2, 2.0, 1.0, A, 2, 1, 0 )` -- strides in (s1=2, s2=1) order for row-major

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README differences are extensive (222 diff lines)
- repl.txt differences are substantial (144 diff lines)
- TypeScript type differences (124 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Initialize a matrix to given diagonal and off-diagonal values"`
- **Stdlib**: `"description": "Set the off-diagonal elements and the diagonal elements of a double-precision floating-point matrix to specified values."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.dlaset.js`, `test.ndarray.js`
- **Stdlib**: uses JSON fixture files (24 files across stride/offset variants)

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (43 diff lines)
