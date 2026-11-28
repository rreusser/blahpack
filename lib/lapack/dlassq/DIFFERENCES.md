# dlassq: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dlassq`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dlassq.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Critical API Differences

### `dlassq.js` (layout wrapper)
- **Ours**: `dlassq( N, x, stride, scale, sumsq )` -- returns object `{ scl, sumsq }`
- **Stdlib**: `dlassq( N, X, strideX, scale, sumsq )` -- returns `Float64Array` of length 2 (`[scale, sumsq]`)
- Param naming: ours uses `x`, `stride`; stdlib uses `X`, `strideX`
- **Stdlib** internally allocates `new Float64Array(2)` as output and calls `base(N, X, strideX, ox, scale, sumsq, out, 1, 0)`

### `ndarray.js`
- **Ours**: `dlassq( N, x, stride, offset, scale, sumsq )` -- 6 params, returns object
- **Stdlib**: `dlassq( N, X, strideX, offsetX, scale, sumsq, out, strideOut, offsetOut )` -- 9 params, takes output array + stride + offset
- This is a **critical API difference** -- stdlib's ndarray interface accepts a pre-allocated output array with stride/offset

### `base.js`
- **Ours**: `dlassq( N, x, stride, offset, scale, sumsq )` -- 6 params, returns `{ scl, sumsq }` object
- **Stdlib**: `dlassq( N, X, strideX, offsetX, scale, sumsq, out, strideOut, offsetOut )` -- 9 params, writes to `out` array
- **Ours**: uses `Math.pow(2, 537)` and `Math.pow(2, -538)` for SSML/SBIG constants
- **Stdlib**: likely uses `@stdlib` math utilities
- **Ours**: uses `scale !== scale` for NaN check; **Stdlib**: uses `isnan()` from `@stdlib`
- **Ours**: returns plain object `{ scl: ..., sumsq: ... }`
- **Stdlib**: returns the `out` Float64Array (`out[offsetOut] = scale`, `out[offsetOut + strideOut] = sumsq`)

## [CONVENTION] Coding Style

- **Ours**: copyright year `2025`; **Stdlib**: copyright year `2024`
- **Ours**: `@param {Float64Array} x` (lowercase); **Stdlib**: `@param {Float64Array} X` (uppercase)
- **Ours**: `@param {integer} stride` (generic); **Stdlib**: `@param {integer} strideX` (array-specific)
- **Ours**: `@returns {Object} object with scl and sumsq properties`
- **Stdlib**: `@returns {Float64Array} output array`
- **Ours**: ndarray.js has validation (throws `RangeError` for `N < 0`)
- **Stdlib**: ndarray.js has no validation
- **Ours**: has `/* eslint-disable max-len, max-params */`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: example `dlassq( 2, x, 1, 1.0, 1.0 )` -- no shown result
- **Stdlib**: example `var out = dlassq( X.length, X, 1, 1.0, 0.0 ); // returns <Float64Array>[ 1.0, 30.0 ]`
- **Ours**: ndarray example `dlassq.ndarray( 2, x, 1, 0, 1.0, 1.0 )` -- 6 params
- **Stdlib**: ndarray example `dlassq.ndarray( X.length, X, 1, 0, 1.0, 0.0, out, 1, 0 )` -- 9 params

## [CONVENTION] main.js

- **Ours**: copyright year `2025`; **Stdlib**: `2024`
- Otherwise identical structure

## [DOCUMENTATION] JSDoc / README

- README differences extensive (246 diff lines)
- repl.txt differences substantial (132 diff lines)
- TypeScript type differences (115 diff lines) -- reflect the output format API difference

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Return an updated sum of squares represented in scaled form"`
- **Stdlib**: `"description": "Return an updated sum of squares represented in scaled form."` (only period difference)
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.dlassq.js`, `test.ndarray.js`

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (34 diff lines)
