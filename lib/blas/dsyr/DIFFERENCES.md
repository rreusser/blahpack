# dsyr: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dsyr/`) against the stdlib-js
reference (`@stdlib/blas/base/dsyr`).

---

## [STRUCTURAL] Missing Files

- `benchmark/benchmark.js`, `benchmark.native.js`, `benchmark.ndarray.js`,
  `benchmark.ndarray.native.js`
- `benchmark/c/` (C benchmarks)
- `docs/types/test.ts`
- `examples/c/`
- `test/test.dsyr.js`, `test/test.dsyr.native.js`
- `test/test.ndarray.js`, `test/test.ndarray.native.js`
- `test/fixtures/` (22 individual JSON fixture files)
- `binding.gyp`, `include.gypi`, `manifest.json`
- `include/stdlib/blas/base/dsyr.h`, `dsyr_cblas.h`
- `src/addon.c`, `src/dsyr.c`, `src/dsyr_cblas.c`, `src/dsyr_ndarray.c`
- `lib/dsyr.native.js`, `lib/native.js`, `lib/ndarray.native.js`

Our module has `LEARNINGS.integrated.md` (not in stdlib).

---

## [SIGNATURE] base.js -- Matching Signatures

Both have the same base.js signature:
```
dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA )
```

**Stdlib** uses `@stdlib/ndarray/base/assert/is-row-major` for layout
detection and swaps loop dimensions accordingly.

**Ours** uses direct stride variables without `isRowMajor`. Both are
functionally equivalent for the ndarray API since strides encode the
layout.

---

## [SIGNATURE] dsyr.js (Layout Wrapper) -- Missing Validation

Both have the same signature:
```
dsyr( order, uplo, N, alpha, x, strideX, A, LDA )
```

**Stdlib** validates: order, uplo, N >= 0, strideX != 0, LDA >= max(1, N).

**Ours** validates only: order (isLayout). Missing: uplo, N, strideX, LDA.

---

## [SIGNATURE] ndarray.js -- Missing Stride Validation

Both have the same signature:
```
dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA )
```

**Stdlib** validates: uplo, N >= 0, strideX != 0, strideA1 != 0,
strideA2 != 0. Note: stdlib error message says "must specify whether to
reference the lower or upper triangular matrix" (more descriptive).

**Ours** validates: uplo (isMatrixTriangle), N >= 0, strideX != 0.
Missing: strideA1 != 0, strideA2 != 0.

---

## [CONVENTION] ndarray.js -- Duplicate JSDoc

**Ours** has a JSDoc block above the `'use strict'` pragma (outside the
module body) then another inside the `// MAIN //` section. **Stdlib** has
only the inner block.

---

## [CONVENTION] index.js -- Native Addon Loading

**Stdlib** uses `tryRequire`/`isError` pattern.
**Ours** re-exports `./main.js` directly.

---

## [DOCUMENTATION] index.js -- Examples

**Stdlib**: BLAS-style example with expected output values.
**Ours**: Both BLAS-style and ndarray examples, no expected output.

---

## [DOCUMENTATION] README.md

**Stdlib**: Both APIs documented with full parameter lists, notes, examples.
**Ours**: Ndarray API only.

---

## [DOCUMENTATION] docs/types/index.d.ts

**Stdlib**: Both BLAS-style (with `Layout`, `MatrixTriangle` types) and
`ndarray()` signatures. Full JSDoc with examples.

**Ours**: Only ndarray-style. Bare `string` types. No license, no examples.

---

## [TESTING] test/test.js

**Stdlib**: `tape`, split into 5 test files (including native), per-scenario
JSON fixtures (22 files).

**Ours**: `node:test`, single file with hand-written test cases (not
JSONL-based like most other modules). Tests basic cases but has far fewer
scenarios than stdlib's fixture-driven tests.

---

## [BENCHMARK] Missing Benchmarks

Stdlib has 4 JS benchmark files and C benchmarks.
Ours has no `benchmark/` directory.

---

## [CONVENTION] package.json

| Field | Stdlib | Ours |
|---|---|---|
| `main` | `"./lib"` | `"./lib/index.js"` |
| `gypfile` | `true` | Absent |
| `directories` | benchmark, include, src | Absent |
| `types` | `"./docs/types"` | Absent |
| `scripts` | `{}` | `{"test": "node --test test/test.js"}` |
| `homepage`, `repository`, `bugs` | Present | Absent |
| `engines`, `os`, `keywords` | Present | Absent |
| `description` | Unicode (`A = alpha*x*x^T + A`) | ASCII (`A := alpha*x*x**T + A`) |

---

## [OPTIMIZATION] base.js -- Four-wide register-blocked rank update

The reference walks one column of `A` at a time. Our `base.js` selects
whichever traversal walks `A`'s smaller-stride dimension in the inner loop
and register-blocks the other dimension four wide, so a single pass over the
vector operand feeds four output streams. Only the stored triangle is read or written; the reference `x[j] !== 0` column guard is preserved.

- **Verification tier**: **bit-identical** (see `docs/optimization-policy.md`).
  The kernel only reschedules memory -- each element of `A` still receives a
  single reference-order update, with no summation reordered -- so it is held
  to the strict tier rather than a tolerance. Gated against the preserved
  reference kernel with `Object.is` over the FULL `A` storage (which also
  proves no element outside the reference's write set is touched) over 2640
  cases spanning col/row/general/negative-stride layouts, vector strides in
  {1, 2, -1}, sizes 0..64, and alpha specials (`bench/dsyr-opt/check.mjs`).
- **Measured**: 2.0-2.5x at `n` in {500, 2000}, both layouts. This is a
  memory-bound symmetric rank-1 update `A += alpha*x*x^T` (one read plus one write of `A` per element), and the
  kernel moves `A` at 19-35 GB/s against a ~40 GB/s streaming ceiling on the
  reference machine, so it is now near the bandwidth limit
  (`bench/dsyr-opt/bench.mjs`).
- **Oracle preserved**: `bench/dsyr-opt/variants/v0-reference.js`.
