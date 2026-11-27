# dpttrf: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dpttrf`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dpttrf.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Critical API Differences

### `dpttrf.js` (layout wrapper)
- **Ours**: `dpttrf( N, d, strideD, e, strideE )` -- 5 params, includes stride parameters
- **Stdlib**: `dpttrf( N, D, E )` -- 3 params, LAPACK-style (unit stride only)
- Ours includes stride parameters in the layout wrapper, which is **not the stdlib convention** -- the layout wrapper should only accept the simple LAPACK-like signature
- **Stdlib** validates `N < 0` with `RangeError`; ours does not
- Param casing: ours uses `d`, `e` (lowercase); stdlib uses `D`, `E` (uppercase)

### `ndarray.js`
- **Ours**: `dpttrf( N, d, strideD, offsetD, e, strideE, offsetE )` -- lowercase params, no validation
- **Stdlib**: `dpttrf( N, D, strideD, offsetD, E, strideE, offsetE )` -- uppercase params, validates `N < 0`
- Stdlib imports `format` and throws `RangeError` for negative N; ours has no validation

### `base.js`
- Signatures match (same params: N, D/d, strideD, offsetD, E/e, strideE, offsetE)
- **Ours**: uses `var info` tracking variable, returns `info` at end
- **Stdlib**: returns literal values inline (`return 0`, `return i+1`, `return N`)
- **Ours**: has `/* eslint-disable max-len, max-params */` (stdlib does not)
- Param casing: ours lowercase (`d`, `e`); stdlib uppercase (`D`, `E`)

## [SIGNATURE] Return Value Convention

- **Ours**: returns `info` variable (0 = success, positive = error at 1-based index)
- **Stdlib**: returns inline (`return 0` for success, `return i+1` for error at element i, `return N` for last-element error)
- Both use 1-based error indices (Fortran convention), so return values appear compatible

## [CONVENTION] Coding Style

- **Ours**: `dpttrf.js`, `main.js`, `ndarray.js`, `index.js` all missing license headers
- **Stdlib**: all files have Apache-2.0 license headers (copyright `2024`)
- Param naming: ours lowercase (`d`, `e`), stdlib uppercase (`D`, `E`)
- **Ours**: `@param {Float64Array} d - d`; **Stdlib**: `@param {Float64Array} D - the N diagonal elements of A`
- **Ours**: `@returns {*} result`; **Stdlib**: `@returns {integer} status code` with `@throws {RangeError}`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern; missing license header
- **Stdlib**: has full license header, `tryRequire('./native.js')` pattern
- **Ours**: `@module` description: "Computes the LDL^T factorization..."
- **Stdlib**: `@module` description: "LAPACK routine to compute the `L * D * L^T` factorization..."
- **Ours**: `@example` is `// TODO: Add example`
- **Stdlib**: has complete examples for both `.()` and `.ndarray()` with expected output

## [CONVENTION] main.js

- **Ours**: missing license header entirely
- **Stdlib**: has full Apache-2.0 license header

## [DOCUMENTATION] JSDoc / README

- README differences extensive (228 diff lines)
- repl.txt differences substantial (165 diff lines)
- TypeScript type differences (127 diff lines)

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Computes the LDL^T factorization of a real symmetric positive definite tridiagonal matrix"`
- **Stdlib**: `"description": "Compute the L * D * L^T factorization of a real symmetric positive definite tridiagonal matrix A."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os, benchmark dir

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.dpttrf.js`, `test.ndarray.js`

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Significant differences (41 diff lines)
