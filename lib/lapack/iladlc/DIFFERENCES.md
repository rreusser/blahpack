# iladlc: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/iladlc`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.iladlc.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/fixtures/` -- stdlib has 20 JSON fixture files across directories (column_major, row_major, column_major_zeros, row_major_zeros variants in root, large_strides, mixed_strides, negative_strides, offsets subdirectories)
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Function Signature Differences

### `iladlc.js` (layout wrapper)
- Signatures match: `iladlc( order, M, N, A, LDA )`
- **Ours**: missing `@throws` for LDA range validation
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {integer} index of the last non-zero column`
- **Stdlib** imports `isRowMajor`, `isColumnMajor`, `max` and validates `LDA >= max(1, s)` where s depends on layout
- **Ours** has no LDA validation

### `ndarray.js`
- Signatures match: `iladlc( M, N, A, strideA1, strideA2, offsetA )`
- **Ours**: has validation (imports `format`; throws `RangeError` for `M < 0`, `N < 0`)
- **Stdlib**: no validation in ndarray

### `base.js` -- CRITICAL IMPLEMENTATION DIFFERENCE
- **Ours**: full standalone implementation (scans columns from the end, with quick-test optimization for corner elements)
- **Stdlib**: **delegates entirely to `iladlr`** by transposing strides: `return iladlr( N, M, A, strideA2, strideA1, offsetA )`
- This means stdlib imports and depends on `@stdlib/lapack/base/iladlr` while ours is self-contained
- Both should produce the same results, but the stdlib approach is more elegant (finding last non-zero column = finding last non-zero row of the transpose)

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */` at top of base.js
- **Stdlib**: does not need it (single-line delegation)
- **Ours**: description "Scans a real matrix for its last non-zero column"
- **Stdlib**: description "Returns the index of the last non-zero column in a matrix `A`"
- **Stdlib** base.js has a `## Notes` section documenting the -1 return for empty/zero matrices; ours does not
- **Ours**: `@param {NonNegativeInteger} M`; **Stdlib**: `@param {PositiveInteger} M`
- **Ours**: `@param {PositiveInteger} LDA - leading dimension of A`; **Stdlib**: `@param {integer} LDA - stride of the first dimension of A (a.k.a., leading dimension of the matrix A)`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: has two `@example` blocks (one for layout, one for ndarray)
- **Stdlib**: has one `@example` block (layout only) showing result `// returns 1`
- **Stdlib** uses `Float64array` (lowercase a) in examples -- likely a typo in stdlib

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README differences moderate (222 diff lines)
- repl.txt differences substantial (119 diff lines)
- TypeScript type differences (123 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Find the last non-zero column of a real matrix."`
- **Stdlib**: `"description": "LAPACK routine to find the index of the last non-zero column in an input matrix."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files plus 20 fixture JSONs across stride/offset variants

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Differences (38 diff lines)
