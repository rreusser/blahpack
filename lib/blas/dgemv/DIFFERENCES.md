# dgemv: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dgemv/`) against the stdlib-js
reference (`@stdlib/blas/base/dgemv`).

---

## [STRUCTURAL] Missing Files

The following files exist in stdlib but are absent from our module:

- `benchmark/benchmark.js` (BLAS-style benchmarks)
- `benchmark/benchmark.native.js`
- `benchmark/benchmark.ndarray.js`
- `benchmark/benchmark.ndarray.native.js`
- `benchmark/c/` (C benchmarks)
- `docs/types/test.ts` (TypeScript compile-time assertion tests)
- `examples/c/` (C example code)
- `test/test.dgemv.js` (BLAS-style layout API tests)
- `test/test.dgemv.native.js`
- `test/test.ndarray.js` (ndarray API tests)
- `test/test.ndarray.native.js`
- `test/fixtures/` (30 individual JSON fixture files)
- `binding.gyp`, `include.gypi`, `manifest.json` (native addon build)
- `include/stdlib/blas/base/dgemv.h`, `dgemv_cblas.h` (C headers)
- `src/addon.c`, `src/dgemv.c`, `src/dgemv_cblas.c`, `src/dgemv_ndarray.c`
- `lib/dgemv.native.js`, `lib/native.js`, `lib/ndarray.native.js`

Our module has a single `test/test.js` using JSONL fixtures and
`LEARNINGS.integrated.md` (not in stdlib).

---

## [SIGNATURE] base.js -- Different Algorithm Structure

**Stdlib**: Uses helper utilities from other stdlib packages:
- `@stdlib/ndarray/base/assert/is-row-major` for layout detection
- `@stdlib/blas/ext/base/dfill` (ndarray) for zeroing vectors
- `@stdlib/blas/base/dscal` (ndarray) for vector scaling
- Private `isTransposed()` helper function
- Two-pass structure: first handle y scaling (beta), then matrix-vector product

**Ours**: Optimized layout-adaptive blocked kernel (previously a direct
Fortran-to-JS translation). No external dependencies for fill/scale.
Functionally equivalent but uses a different code structure.

---

## [OPTIMIZATION] base.js -- Layout-adaptive four-wide register blocking

The reference (BLAS 3.12.0 `dgemv.f`) always iterates rows in the inner
loop. Our `base.js` treats `B = op(A)` and selects dot form (four rows per
pass, four accumulators) or axpy form (four columns per pass, fused `y`
update) so the inner loop always walks the smaller-stride dimension.

- **Verification tier**: backward error (both forms reorder summation; see
  `docs/optimization-policy.md`). Gated against the preserved reference
  kernel elementwise at rel. tol. `1e-14 * max(4, K)` over 3000 cases
  spanning transpose modes, layouts, general/negative strides, remainder
  sizes, and alpha/beta specials (`bench/dgemv-opt/check.mjs`).
- **Measured**: ~2.0-2.6x across square/tall/wide shapes, both layouts,
  both transpose modes (`bench/dgemv-opt/bench.mjs`).
- **Oracle preserved**: `bench/dgemv-opt/variants/v0-reference.js`.

---

## [CONVENTION] base.js -- Missing eslint Directives

**Stdlib**: Uses `/* eslint-disable max-params, max-len */` inline on
the function declaration line.

**Ours**: Uses `/* eslint-disable max-len, max-params */` as a top-level
file-wide directive (before `'use strict'`). Also adds `max-statements`.

---

## [CONVENTION] ndarray.js -- Duplicate Import

**Ours** imports the same module twice under different names:
```js
var isMatrixTranspose = require( '@stdlib/blas/base/assert/is-transpose-operation' );
var isTransposeOperation = require( '@stdlib/blas/base/assert/is-transpose-operation' );
```
Only `isMatrixTranspose` is used. The `isTransposeOperation` import is dead code.

**Stdlib** imports it once as `isMatrixTranspose`.

---

## [CONVENTION] ndarray.js -- Duplicate JSDoc Before use-strict

**Ours** has a JSDoc block above the `'use strict'` pragma (outside the
module body), then another JSDoc block inside the `// MAIN //` section.
**Stdlib** has only the inner JSDoc block.

---

## [CONVENTION] ndarray.js -- eslint Placement

**Ours** has `/* eslint-disable max-len, max-params */` between the outer
JSDoc and `'use strict'`. **Stdlib** has it inline on the function line.

---

## [DOCUMENTATION] ndarray.js -- JSDoc Wording

**Stdlib**: Uses unicode characters and backtick-quoted parameter names
(e.g., "stride of the first dimension of `A`").

**Ours**: Uses ASCII-only descriptions without backticks on parameter names
in the outer JSDoc (e.g., "stride of the first dimension of A").

---

## [CONVENTION] index.js -- Native Addon Loading

**Stdlib** uses `tryRequire`/`isError` pattern for native addon fallback.
**Ours** simply re-exports `./main.js`.

---

## [DOCUMENTATION] index.js -- @module Description

**Stdlib**: Full mathematical description with Unicode operators and
expected output values in examples.

**Ours**: ASCII-only description, no expected output in examples.

---

## [DOCUMENTATION] README.md

**Stdlib**: Documents both BLAS-style and ndarray APIs with full parameter
lists, notes, and examples.

**Ours**: Documents only the ndarray API with minimal parameter descriptions.

---

## [DOCUMENTATION] docs/repl.txt

**Stdlib**: Documents both BLAS-style and ndarray APIs.
**Ours**: Documents only the ndarray API with minimal descriptions.

---

## [DOCUMENTATION] docs/types/index.d.ts

**Stdlib**: Defines both BLAS-style (with `Layout`, `TransposeOperation`
types) and `ndarray()` method signatures. Full JSDoc with examples.

**Ours**: Defines only the ndarray-style call. Uses bare `string` types.
No license header, no type imports, no JSDoc examples.

---

## [TESTING] test/test.js

**Stdlib**: Uses `tape` + `proxyquire` with `IS_BROWSER` skip. Tests
split across 5 files (including native test files). Per-scenario JSON
fixtures.

**Ours**: Uses `node:test` + `node:assert/strict`. Single file with JSONL
fixtures from shared directory.

---

## [BENCHMARK] Missing Benchmarks

Stdlib has 4 JS benchmark files and C benchmarks.
Ours has no `benchmark/` directory.

---

## [CONVENTION] package.json

| Field | Stdlib | Ours |
|---|---|---|
| `main` | `"./lib"` | `"./lib/index.js"` |
| `browser` | `"./lib/main.js"` | Absent |
| `gypfile` | `true` | Absent |
| `directories.benchmark` | Present | Absent |
| `directories.include` | Present | Absent |
| `directories.src` | Present | Absent |
| `types` | `"./docs/types"` | Absent |
| `scripts` | `{}` | `{"test": "node --test test/test.js"}` |
| `homepage` | Present | Absent |
| `repository` | Present | Absent |
| `bugs` | Present | Absent |
| `engines` | Present | Absent |
| `os` | Present | Absent |
| `keywords` | Present | Absent |
| `description` | Unicode operators | ASCII-only |

---

## [SIGNATURE] dgemv.js (Layout Wrapper) -- Missing Validation

**Stdlib** validates:
- `order` (isLayout)
- `trans` (isMatrixTranspose)
- `M >= 0`, `N >= 0` (RangeError)
- `LDA >= max(1, vala)` where vala depends on layout/transpose
- `strideX !== 0` (RangeError)
- `strideY !== 0` (RangeError)

**Ours** validates only:
- `order` (isLayout)

Missing: all other parameter checks (trans, M, N, LDA, strideX, strideY).

---

## [SIGNATURE] ndarray.js -- Matching Validation

Both validate the same set of checks (trans, M >= 0, N >= 0, strideX != 0,
strideY != 0). Validation is functionally equivalent.

---

## [CONVENTION] examples/index.js

**Stdlib**: Uses `discreteUniform` for random data, calls both APIs.
**Ours**: Hard-coded small example, may call base.js directly.
