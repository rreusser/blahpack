# zlacpy: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/zlacpy`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.zlacpy.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Function Signature Differences

### `zlacpy.js` (layout wrapper)
- Signatures match: `zlacpy( order, uplo, M, N, A, LDA, B, LDB )`
- **Ours**: missing `@throws` annotations for LDA/LDB range validation
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {Complex128Array} B` with `@throws {RangeError}`
- **Stdlib**: has `isColumnMajor` require and LDA/LDB >= N validation
- **Stdlib**: has multiple `@example` blocks showing all/upper/lower with Complex128 output verification
- **Ours**: description "Copies all or part of a complex matrix `A` to another complex matrix `B`"
- **Stdlib**: description "Copies all or part of a matrix `A` to another matrix `B`" (more generic)

### `ndarray.js`
- Signatures match: `zlacpy( uplo, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB )`
- **Ours**: has input validation (imports `format`, `isMatrixTriangle`; throws `TypeError`/`RangeError`)
- **Stdlib**: no input validation -- delegates directly to `base`

### `base.js`
- **Ours**: single monolithic function with if/else branches for uplo (564 diff lines)
- **Stdlib**: four separate functions (`copyAll`, `copyUpper`, `copyLower`, `zlacpy`) -- dispatcher pattern
- Both operate on the underlying Float64Array view of Complex128Array
- Both have the same base parameter signature

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: no such disable -- separate functions keep each short
- **Ours**: `@param {Float64Array} B - input matrix`; **Stdlib**: `@param {Complex128Array} B - output matrix`
- **Ours**: LDA described as "leading dimension"; **Stdlib**: "stride of the first dimension (a.k.a., leading dimension)"

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: examples use pre-filled arrays and `zlacpy( 'row-major', 'upper', ... )`
- **Stdlib**: examples show `zlacpy( 'row-major', 'all', ... )` with result verification via `.get()` and `// returns <Complex128>[...]`
- **Ours**: ndarray example uses `Float64Array` incorrectly instead of `Complex128Array`
- **Stdlib**: ndarray example correctly uses `Complex128Array` with offsets
- **Stdlib** imports `real`/`imag` from `@stdlib/complex` for example output verification

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README differences extensive (256 diff lines)
- repl.txt differences substantial (168 diff lines)
- TypeScript type differences (141 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Copy all or part of a complex matrix"`
- **Stdlib**: `"description": "Copy all or part of a matrix A to another matrix B."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.zlacpy.js`, `test.ndarray.js`

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (51 diff lines)
