# dlaswp: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dlaswp`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dlaswp.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/fixtures/` -- stdlib has 24 JSON fixture files (row_major/column_major variants with various stride, offset, and reverse pivot configurations)
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Critical API Differences

### `dlaswp.js` (layout wrapper)
- **Ours**: `dlaswp( order, N, A, LDA, k1, k2, inck, IPIV, strideIPIV )` -- 9 params; the strided projection of the ndarray signature
- **Stdlib**: `dlaswp( order, N, A, LDA, k1, k2, IPIV, incx )` -- 8 params
- Stdlib's single `incx` both selects direction (sign) and strides `IPIV`. Ours splits it: `inck` selects direction, `strideIPIV` strides `IPIV` (offset from `stride2offset( k2+1, strideIPIV )`; the pivot for row `k` is at `IPIV[ o + k*strideIPIV ]`, matching ndarray). Stdlib `incx = ±1` ≡ ours `inck = ±1, strideIPIV = 1`. Stdlib `incx = 0` is a no-op; ours `inck = 0` applies pivots in order (as ndarray does). For `|incx| > 1`, stdlib reads row `k`'s pivot at `IPIV[ k1 + (k-k1)*|incx| ]` (Fortran convention); ours at `IPIV[ k*strideIPIV ]`.
- **Stdlib** has `@throws {RangeError}` for LDA validation; ours does not
- **Stdlib** has `@example` blocks in JSDoc; ours does not

### `ndarray.js`
- **Ours**: `dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx )` -- incx is LAST
- **Stdlib**: `dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV )` -- inck is BEFORE IPIV
- **Different parameter ordering**: `incx`/`inck` position differs. Stdlib places `inck` before `IPIV` params; ours places `incx` after `IPIV` params.
- Param name: ours `incx`; stdlib `inck`
- **Ours**: has validation (throws `RangeError` for `N < 0`)
- **Stdlib**: no validation in ndarray

### `base.js`
- Same parameter ordering difference as ndarray: `incx` last in ours, `inck` before IPIV in stdlib
- **Ours**: `dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx )`
- **Stdlib**: `dlaswp( N, A, strideA1, strideA2, offsetA, k1, k2, inck, IPIV, strideIPIV, offsetIPIV )`
- **Stdlib** uses `isRowMajor`, `isColumnMajor`, `max` from stdlib modules
- **Ours** uses raw string comparison (`order === 'column-major'`)

## [CONVENTION] Coding Style

- **Ours**: copyright year `2025`; **Stdlib**: `2024`
- **Ours**: has `/* eslint-disable max-len, max-params */`
- **Ours**: uses `stride2offset` in layout wrapper; **Stdlib** computes strides/offsets inline
- **Ours**: routine.js uses raw `order === 'column-major'`; **Stdlib** uses `isRowMajor(order)`/`isColumnMajor(order)` utility
- **Ours**: `@param {integer} strideIPIV` / `@param {integer} incx`
- **Stdlib**: `@param {Int32Array} IPIV - vector of pivot indices` / `@param {integer} incx - increment between successive values of IPIV`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: example shows `dlaswp( 'row-major', 2, A, 2, 0, 1, IPIV, 1, 2 )` -- 9 args
- **Stdlib**: example shows `dlaswp( 'row-major', 2, A, 2, 0, 2, IPIV, 1 )` -- 8 args
- **Ours**: ndarray example has placeholder-looking args

## [CONVENTION] main.js

- **Ours**: copyright year `2025`; **Stdlib**: `2024`

## [DOCUMENTATION] JSDoc / README

- README differences extensive (309 diff lines)
- repl.txt differences substantial (124 diff lines)
- TypeScript type differences (114 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Perform a series of row interchanges on a matrix A using pivot indices stored in IPIV."`
- **Stdlib**: `"description": "Perform a series of row interchanges on an input matrix."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files plus 24 fixture JSONs

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Differences (31 diff lines)
