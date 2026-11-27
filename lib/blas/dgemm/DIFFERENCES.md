# dgemm: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dgemm/`) against the stdlib-js
reference (`@stdlib/blas/base/dgemm`).

---

## [STRUCTURAL] Missing Files

The following files exist in stdlib but are absent from our module:

- `benchmark/` (40 benchmark files covering all layout/transpose combos)
- `docs/types/test.ts` (TypeScript compile-time assertion tests)
- `test/test.dgemm.js` (BLAS-style layout API tests)
- `test/test.ndarray.js` (ndarray API tests in a separate file)
- `test/fixtures/` (100+ individual JSON fixture files per scenario)

Our module has a single `test/test.js` using JSONL fixtures from a shared
`test/fixtures/` directory. Stdlib splits tests into three files and ships
per-scenario JSON fixtures alongside each module.

We also have `LEARNINGS.integrated.md` which does not exist in stdlib.

---

## [SIGNATURE] base.js -- Different Algorithm

**Stdlib**: Uses a highly optimized implementation with:
- `@stdlib/ndarray/base/assert/is-row-major` for layout detection
- `@stdlib/blas/base/ddot` (ndarray) for dot-product inner kernel
- `@stdlib/ndarray/base/unary-tiling-block-size` for cache-blocking
- Helper functions: `isTransposed()`, `zeros()`, `scal()`, `naive()`, `blocked()`
- Loop-tiling / blocked matrix multiplication for cache performance

**Ours**: Direct Fortran-to-JS translation with four explicit nested-loop
branches (notA/notB, notA/transB, transA/notB, transA/transB). No loop
tiling, no ddot kernel, no cache-blocking. This is a faithful port of the
reference BLAS but will be slower for large matrices.

---

## [SIGNATURE] dgemm.js (Layout Wrapper) -- Missing Validation

**Stdlib** validates:
- `order` (isLayout)
- `transA`, `transB` (isMatrixTranspose)
- `M`, `N`, `K` >= 0
- `LDA >= max(1, nrowsa)` (leading dimension vs actual rows)
- `LDB >= max(1, nrowsb)`
- `LDC >= max(1, valc)`

Uses `@stdlib/math/base/special/fast/max`, `isRowMajor`, `isColumnMajor`
for computing the leading-dimension checks.

**Ours** validates only:
- `order` (isLayout)

Missing: transpose validation, M/N/K range checks, LDA/LDB/LDC dimension
checks. Missing imports: `max`, `isMatrixTranspose`, `isRowMajor`,
`isColumnMajor`.

---

## [SIGNATURE] ndarray.js -- Missing strideC Validation

**Stdlib** validates `strideC1 !== 0` and `strideC2 !== 0` (throws
RangeError for seventeenth/eighteenth arguments).

**Ours** does not validate strideC1 or strideC2.

**Stdlib** also has a bug on line 82: the N-check error message prints `M`
instead of `N` (`Value: \`%d\`.', M`). Our code does the same.

---

## [CONVENTION] ndarray.js -- File Layout

**Stdlib**: JSDoc and eslint directives are inside the file after the
license header, in the standard `// MODULES //` / `// MAIN //` /
`// EXPORTS //` section pattern.

**Ours**: Has a duplicate JSDoc block before the `'use strict'` pragma (one
outside and one inside the standard sections). Also has duplicate imports:
both `isMatrixTranspose` and `isTransposeOperation` are required from the
same module (only `isMatrixTranspose` is used).

---

## [CONVENTION] Parameter Naming

**Stdlib**: Uses `transA`, `transB` (camelCase with uppercase letter).
**Ours**: Uses `transa`, `transb` (all lowercase).

---

## [CONVENTION] index.js -- Native Addon Loading

**Stdlib** uses the `tryRequire` / `isError` pattern to attempt loading
`./native.js` for native BLAS binding fallback:
```js
var tmp = tryRequire( join( __dirname, './native.js' ) );
if ( isError( tmp ) ) { dgemm = main; } else { dgemm = tmp; }
```

**Ours** simply re-exports `./main.js` without native addon support.

---

## [DOCUMENTATION] index.js -- @module Description

**Stdlib**: Full mathematical description with Unicode operators.
**Ours**: Short description "Double-precision real matrix-matrix multiply."

**Stdlib** examples show expected output values; ours do not.

---

## [DOCUMENTATION] README.md

**Stdlib**: Documents both BLAS-style (`dgemm(order, ...)`) and ndarray
APIs with full parameter lists, notes about early returns, typed-array
view usage, and a complete example section.

**Ours**: Documents only the ndarray API. Has `TODO: Add usage example`
placeholder. Parameter descriptions are less detailed (e.g., "K: number of
superdiagonals" is incorrect for dgemm -- should be "inner dimension" or
"columns of op(A)").

---

## [DOCUMENTATION] docs/repl.txt

**Stdlib**: Documents both the BLAS-style call and the `.ndarray()` method
with full parameter descriptions, return values, notes, and examples.

**Ours**: Documents only the `.ndarray()` method. Parameter descriptions
are minimal (e.g., "specifies the operation type" vs. stdlib's full
description).

---

## [DOCUMENTATION] docs/types/index.d.ts

**Stdlib**: Defines both the BLAS-style call signature (with `Layout`,
`TransposeOperation` types from `@stdlib/types/blas`) and the `ndarray()`
method on the `Routine` interface. Includes `/// <reference types>` and
full JSDoc with examples.

**Ours**: Defines only the ndarray-style signature. Uses bare `string`
types instead of `TransposeOperation`. No license header, no `@stdlib/types`
reference, no JSDoc examples, no BLAS-style call signature.

---

## [TESTING] test/test.js

**Stdlib**: Uses `tape` + `proxyquire` with `IS_BROWSER` skip logic. Tests
are split across `test.js`, `test.dgemm.js`, `test.ndarray.js`. Each test
file loads individual JSON fixtures from `test/fixtures/`.

**Ours**: Uses `node:test` + `node:assert/strict`. Single `test/test.js`
loads JSONL from a shared fixtures directory. Uses custom `assertClose`
and `assertArrayClose` helpers for floating-point comparison.

---

## [BENCHMARK] Missing Benchmarks

Stdlib has 40 benchmark files covering every combination of row/column
major, transposed/not-transposed, for both BLAS-style and ndarray APIs.

Ours has no `benchmark/` directory.

---

## [CONVENTION] package.json

| Field | Stdlib | Ours |
|---|---|---|
| `main` | `"./lib"` | `"./lib/index.js"` |
| `directories.benchmark` | Present | Absent |
| `types` | `"./docs/types"` | Absent |
| `scripts` | `{}` | `{"test": "node --test test/test.js"}` |
| `homepage` | Present | Absent |
| `repository` | Present | Absent |
| `bugs` | Present | Absent |
| `engines` | Present | Absent |
| `os` | Present | Absent |
| `keywords` | Present (19 keywords) | Absent |
| `description` | Full math notation | Short description |

---

## [CONVENTION] examples/index.js

**Stdlib**: Uses `@stdlib/random/array/discrete-uniform` to generate random
data, calls both BLAS-style and ndarray APIs, prints output.

**Ours**: Hard-coded small example, calls only `base.js` directly (not
through the public API), no BLAS-style call.
