# dtrsv: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dtrsv/`) against the stdlib-js
reference (`@stdlib/blas/base/dtrsv`).

---

## [STRUCTURAL] Missing Files

- `benchmark/benchmark.js`, `benchmark/benchmark.ndarray.js`
- `docs/types/test.ts`
- `test/test.dtrsv.js` (BLAS-style tests)
- `test/test.ndarray.js`
- `test/fixtures/` (34 individual JSON fixture files)

Our module has `LEARNINGS.integrated.md` (not in stdlib).

---

## [SIGNATURE] base.js -- Matching Signatures

Both have the same base.js signature:
```
dtrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX )
```

**Stdlib** uses `@stdlib/ndarray/base/assert/is-row-major` to detect layout
and swap loop dimensions. Variable naming uses `sa0`/`sa1` convention and
`nonunit` boolean.

**Ours** uses `sa1`/`sa2` naming and `nounit` boolean. Logic is equivalent.

---

## [SIGNATURE] dtrsv.js (Layout Wrapper) -- Missing Validation

Both have the same signature:
```
dtrsv( order, uplo, trans, diag, N, A, LDA, x, strideX )
```

**Stdlib** validates: order, uplo, trans, diag, N >= 0, LDA >= max(1, N),
strideX != 0.

**Ours** validates only: order (isLayout). Missing: uplo, trans, diag, N,
LDA, strideX.

---

## [SIGNATURE] ndarray.js -- Missing Stride Validation

Both have the same signature:
```
dtrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX )
```

**Stdlib** validates: uplo, trans, diag, N >= 0, strideA1 != 0,
strideA2 != 0, strideX != 0.

**Ours** validates: uplo, trans, diag, N >= 0, strideX != 0.
Missing: strideA1 != 0, strideA2 != 0.

Uses import names: `isMatrixTriangle`, `isTransposeOperation`, `isDiagonal`
in stdlib vs `isMatrixTriangle`, `isDiagonalType` + duplicate
`isMatrixTranspose`/`isTransposeOperation` in ours.

---

## [CONVENTION] ndarray.js -- Duplicate Imports

**Ours** imports the transpose-operation checker twice under different names:
```js
var isMatrixTranspose = require( '@stdlib/blas/base/assert/is-transpose-operation' );
...
var isTransposeOperation = require( '@stdlib/blas/base/assert/is-transpose-operation' );
```
This is dead code duplication. Only one is used.

**Stdlib** imports it once as `isTransposeOperation`.

Also, our diagonal type checker is named `isDiagonalType` while stdlib
names it `isDiagonal`.

---

## [CONVENTION] ndarray.js -- Duplicate JSDoc

**Ours** has a JSDoc block above the `'use strict'` pragma and another
inside the `// MAIN //` section. **Stdlib** has only the inner block.

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

**Stdlib**: Both APIs documented.
**Ours**: Ndarray API only.

---

## [DOCUMENTATION] docs/types/index.d.ts

**Stdlib**: Both BLAS-style (with `Layout`, `MatrixTriangle`,
`TransposeOperation`, `DiagonalType` types) and `ndarray()` signatures.
Full JSDoc with examples.

**Ours**: Only ndarray-style. Bare `string` types. No license, no examples.

---

## [TESTING] test/test.js

**Stdlib**: `tape`, split into 3 test files, 34 JSON fixture files.
**Ours**: `node:test`, single file, JSONL fixtures.

---

## [BENCHMARK] Missing Benchmarks

Stdlib has 2 JS benchmark files. Ours has none.

---

## [CONVENTION] package.json

| Field | Stdlib | Ours |
|---|---|---|
| `main` | `"./lib"` | `"./lib/index.js"` |
| `directories.benchmark` | Present | Absent |
| `types` | `"./docs/types"` | Absent |
| `scripts` | `{}` | `{"test": "node --test test/test.js"}` |
| `homepage`, `repository`, `bugs` | Present | Absent |
| `engines`, `os`, `keywords` | Present | Absent |
| `description` | Unicode (`A*x = b` or `A^T*x = b`) | Generic description |

---

## [OPTIMIZATION] base.js -- Layout-adaptive four-wide blocked substitution

The reference (BLAS 3.12.0 `dtrsv.f`) performs scalar forward/backward
substitution one unknown at a time. Our `base.js` folds the transpose into
logical strides (`B = op(A)`, which also flips which triangle `B` occupies)
and performs **block substitution**: the 4x4 triangular diagonal corner is
solved with scalar code in reference order (dividing by the diagonal exactly
as the reference does, never reciprocal-multiplying), and the resulting four
solved unknowns are folded into the remaining right-hand sides with a fused
four-wide pass -- whichever of dot or axpy form walks the smaller-stride
dimension. This is the same recurrence with the updates re-associated, not a
different solve method. `diag = 'unit'` never reads the diagonal.

- **Verification tier**: backward error (the blocked updates reorder
  summation; see `docs/optimization-policy.md`). Gated against the preserved
  reference kernel elementwise at rel. tol. `1e-13 * max(4, N)` over 3168
  cases spanning all 8 `uplo x trans x diag` combos,
  col/row/general/negative-stride layouts, `strideX` in {1, 2, -1}, and `N`
  in 0..64, with well-conditioned triangular `A`
  (`bench/dtrsv-opt/check.mjs`).
- **Measured**: 2.0-2.1x col-major and 2.3x row-major at `n` in {500, 2000},
  all `uplo x trans` combos (`bench/dtrsv-opt/bench.mjs`).
- **Oracle preserved**: `bench/dtrsv-opt/variants/v0-reference.js`.
