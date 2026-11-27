# dladiv: Differences from stdlib-js Reference

Compared against: `@stdlib/lapack/base/dladiv`

## [STRUCTURAL] Missing Files

- **Missing** `benchmark/benchmark.js` -- stdlib has JS benchmarks
- **Missing** `benchmark/benchmark.ndarray.js` -- stdlib has ndarray benchmarks
- **Missing** `docs/types/test.ts` -- stdlib has TypeScript tests
- **Missing** `test/test.dladiv.js` -- stdlib has separate test for layout wrapper
- **Missing** `test/test.ndarray.js` -- stdlib has separate test for ndarray API
- **Missing** `test/fixtures/julia/` -- stdlib has 14 Julia-generated JSON fixture files plus runner.jl and REQUIRE
- **Extra** `LEARNINGS.integrated.md` -- not present in stdlib

## [SIGNATURE] Critical API Differences

### `dladiv.js` (layout wrapper)
- **Ours**: `dladiv( a, b, c, d, out )` -- single output array `out[0]=p, out[1]=q`
- **Stdlib**: `dladiv( a, b, c, d, P, Q )` -- two separate output arrays `P` and `Q`
- This is a **breaking API difference** -- different number and semantics of output parameters

### `ndarray.js`
- **Ours**: `dladiv( a, b, c, d, out )` -- wraps base directly with single output
- **Stdlib**: `dladiv( a, b, c, d, P, offsetP, Q, offsetQ )` -- two separate output arrays with offsets

### `base.js`
- **Ours**: `dladiv( a, b, c, d, out )` with `out[0]=p, out[1]=q` and three internal functions (`dladiv`, `dladiv1`, `dladiv2`)
- **Stdlib**: `dladiv( a, b, c, d, P, offsetP, Q, offsetQ )` -- writes to separate P/Q arrays at specified offsets
- **Ours**: 155 lines with full implementation of `dladiv1` and `dladiv2` helper routines
- **Stdlib**: 67 lines -- significantly more compact, appears to have a different/simpler algorithm structure
- **Ours**: has `/* eslint-disable max-len, max-params */`; **Stdlib**: does not

## [CONVENTION] Coding Style

- **Ours**: parameter descriptions use Fortran-style names ("real part of numerator")
- **Stdlib**: parameter descriptions are more precise ("real component of numerator")
- **Ours**: `@returns {Float64Array} out`; **Stdlib**: `@returns {void}` -- stdlib writes to P/Q in place, returns nothing
- **Ours**: `@param {Float64Array} out - output array [p, q]`
- **Stdlib**: `@param {Float64Array} P - array containing an element which is overwritten by the real part of the quotient` and `@param {Float64Array} Q - array containing an element which is overwritten by the imaginary part of the quotient`

## [CONVENTION] index.js

- **Ours**: directly exports `main`; no native addon loading pattern
- **Stdlib**: has `tryRequire('./native.js')` pattern
- **Ours**: `@example` has `dladiv( 1.0, 1.0, 1.0, 1.0, 1.0 )` -- appears to be placeholder
- **Stdlib**: has complete example with `P = new Float64Array(1); Q = new Float64Array(1); dladiv(-13.0, -1.0, -2.0, 1.0, P, Q)`

## [CONVENTION] main.js

- Identical (no differences)

## [DOCUMENTATION] JSDoc / README

- README differences are moderate (173 diff lines)
- repl.txt differences are substantial (125 diff lines)
- TypeScript type differences (108 diff lines) -- reflect the P/Q vs out API difference

## [DOCUMENTATION] package.json

- **Ours**: `"description": "Perform safe complex division in real arithmetic"`
- **Stdlib**: `"description": "LAPACK routine to divide two double-precision complex floating-point numbers in real arithmetic."`
- **Ours**: `"main": "./lib/index.js"`; **Stdlib**: `"main": "./lib"`
- Standard missing fields: types, homepage, repository, bugs, engines, os

## [TESTING] Test Structure

- **Ours**: single `test/test.js`
- **Stdlib**: three test files: `test.js`, `test.dladiv.js`, `test.ndarray.js`
- **Stdlib**: has Julia-generated fixture data for thorough numerical testing (tiny/large values, component scales, etc.)

## [BENCHMARK] Missing Benchmarks

- **Ours**: no benchmark directory
- **Stdlib**: has `benchmark/benchmark.js` and `benchmark/benchmark.ndarray.js`

## [CONVENTION] examples/index.js

- Differences (13 diff lines)
