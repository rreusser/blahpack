# zlaswp: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/zlaswp`

## [STRUCTURAL] Missing Files

- **Missing** `README.md` -- stdlib has full README; ours has no README.md at all
- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.zlaswp.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/fixtures/` -- stdlib has 24 JSON fixture files (row_major/column_major variants with stride, offset, and reverse pivot configurations)
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib (note: ours also lacks it, unlike other modules)

## [SIGNATURE] Critical API Differences

### `zlaswp.js` (layout wrapper)
- **Ours**: `zlaswp( order, N, A, LDA, k1, k2, IPIV, strideIPIV, incx )` -- 9 params, includes `strideIPIV`
- **Stdlib**: `zlaswp( order, N, A, LDA, k1, k2, IPIV, incx )` -- 8 params, no `strideIPIV`
- The `strideIPIV` parameter is **not part of the stdlib LAPACK-style interface** -- stdlib assumes unit stride for IPIV in the layout wrapper
- **Stdlib** has `@throws {RangeError}` for LDA validation; ours does not
- **Stdlib** has `@example` blocks in JSDoc; ours does not

### `ndarray.js`
- **Ours**: `zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx )` -- incx is LAST
- **Stdlib**: `zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV )` -- inck is BEFORE IPIV
- **Different parameter ordering**: `incx`/`inck` position differs. Stdlib places `inck` before `IPIV` params; ours places `incx` after `IPIV` params.
- Param name: ours `incx`; stdlib `inck`
- **Ours**: has validation (throws `RangeError` for `N < 0`)
- **Stdlib**: no validation in ndarray

### `base.js`
- Same parameter ordering difference as ndarray: `incx` last in ours, `inck` before IPIV in stdlib
- **Ours**: `zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx )`
- **Stdlib**: `zlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV )`
- **Stdlib** uses `isRowMajor`, `isColumnMajor`, `max` from stdlib modules
- **Ours** uses raw string comparison (`order === 'column-major'`)

## [CONVENTION] Coding Style

- **Ours**: has `/* eslint-disable max-len, max-params */`
- **Ours**: uses `stride2offset` in layout wrapper
- **Stdlib**: computes strides/offsets inline using layout-aware logic
- **Ours**: description "Performs a series of row interchanges on a complex double-precision matrix `A`"
- **Stdlib**: description "Performs a series of row interchanges on a matrix `A` using pivot indices stored in `IPIV`"
- **Ours**: `@param {integer} strideIPIV - IPIV stride length` / `@param {integer} incx - direction...`
- **Stdlib**: `@param {Int32Array} IPIV - vector of pivot indices` / `@param {integer} incx - increment between successive values of IPIV`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: example `zlaswp( 'row-major', 2, A, 2, 0, 1, IPIV, 1, 2 )` -- 9 args
- **Stdlib**: example `zlaswp( 'row-major', 2, A, 2, 0, 2, IPIV, 1 )` -- 8 args with result
- **Ours**: ndarray example `zlaswp.ndarray( 2, A, 1, 2, 0, 0, 1, IPIV, 1, 0, 2 )` -- incx at end
- **Stdlib**: ndarray example `zlaswp.ndarray( 2, A, 2, 1, 0, 0, 2, 1, IPIV, 1, 0 )` -- inck before IPIV

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README: **ours has no README.md at all** -- this is the only overlapping module completely missing its README
- repl.txt differences substantial (160 diff lines)
- TypeScript type differences (136 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Performs a series of row interchanges (complex double-precision)."`
- **Stdlib**: `"description": "Perform a series of row interchanges on an input matrix."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files plus 24 fixture JSONs

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (46 diff lines)
