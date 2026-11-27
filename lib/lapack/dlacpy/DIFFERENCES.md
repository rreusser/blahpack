# dlacpy: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dlacpy`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `benchmark/c/Makefile` and `benchmark/c/benchmark.size.c` -- stdlib has C benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dlacpy.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/test.dlacpy.native.js` and `test/test.ndarray.native.js` -- stdlib has native binding tests
- **Missing** `lib/dlacpy.native.js`, `lib/native.js`, `lib/ndarray.native.js` -- native addon wrappers
- **Missing** `src/` directory (addon.c, dlacpy.c, dlacpy_ndarray.c, Makefile) -- C implementation
- **Missing** `include/stdlib/lapack/base/dlacpy.h` -- C header
- **Missing** `binding.gyp`, `include.gypi`, `manifest.json` -- native build infrastructure
- **Missing** `examples/c/` directory (Makefile, example.c) -- C examples
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Function Signature Differences

### `dlacpy.js` (layout wrapper)
- Signatures match: `dlacpy( order, uplo, M, N, A, LDA, B, LDB )`
- **Ours**: missing `@throws` annotations for LDA/LDB range validation
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {Float64Array} B` with throw docs
- **Stdlib**: has `isColumnMajor` require and LDA/LDB validation with `RangeError`
- **Stdlib**: has full inline `@example` blocks in JSDoc

### `ndarray.js`
- Signatures match: `dlacpy( uplo, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB )`
- **Ours**: has input validation (imports `format`, `isMatrixTriangle`; throws `TypeError` for invalid uplo, `RangeError` for negative M/N)
- **Stdlib**: no input validation in ndarray -- delegates directly to `base`
- This is reversed from the typical pattern: our ndarray is *more* defensive than stdlib's

### `base.js`
- **Ours**: single monolithic function with if/else branches for uplo
- **Stdlib**: four separate functions (`copyAll`, `copyUpper`, `copyLower`, `dlacpy`) -- dispatcher pattern
- Both have the same parameter signature

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: no such disable -- uses separate functions to keep each short
- **Ours**: copyright year `2025`; **Stdlib**: copyright year `2024` (earlier)
- Parameter descriptions differ: ours says "leading dimension of `A`"; stdlib says "stride of the first dimension of `A` (a.k.a., leading dimension of the matrix `A`)"
- **Ours**: `@param {Float64Array} B - input matrix`; **Stdlib**: `@param {Float64Array} B - output matrix`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern with `isError` fallback
- **Ours**: `@example` has `B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] )` (pre-filled)
- **Stdlib**: `@example` has `B = new Float64Array( 4 )` (zero-initialized, correct for copy)
- **Ours**: ndarray example uses `dlacpy.ndarray( 1.0, 2, 2, 1.0, 1, 2, 0, 1.0, 1, 2, 0 )` -- appears to have placeholder/incorrect args
- **Stdlib**: ndarray example has correct args with arrays and offsets

## [CONVENTION] main.js

- **Ours**: copyright year `2025`; **Stdlib**: `2024`
- Otherwise identical structure

## [DOCUMENTATION] JSDoc / README

- README differences are extensive (363 diff lines)
- repl.txt differences are substantial (113 diff lines)
- TypeScript type differences (110 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- **Stdlib**: has `"browser": "./lib/main.js"`, `"gypfile": true`
- **Stdlib**: has `"include"`, `"src"` directory mappings
- **Ours**: has custom test script; **Stdlib**: has `"scripts": {}`
- **Stdlib**: has full metadata fields (homepage, repository, bugs, engines, os)

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: five test files: `test.js`, `test.dlacpy.js`, `test.dlacpy.native.js`, `test.ndarray.js`, `test.ndarray.native.js`
- **Stdlib**: uses `tape`; **Ours**: uses `node:test`

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has JS and C benchmarks

## [CONVENTION] examples/index.js

- Significant differences (34 diff lines)
