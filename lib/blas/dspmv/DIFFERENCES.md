# dspmv: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dspmv/`) against the stdlib-js
reference (`@stdlib/blas/base/dspmv`).

---

## [STRUCTURAL] Missing Files

- `benchmark/benchmark.js`, `benchmark/benchmark.ndarray.js`
- `docs/types/test.ts`
- `test/test.dspmv.js` (BLAS-style tests)
- `test/test.ndarray.js`
- `test/fixtures/` (10 individual JSON fixture files)

Our module has `LEARNINGS.integrated.md` (not in stdlib).

---

## [SIGNATURE] base.js -- Missing `order` Parameter

**Stdlib** `base.js` signature:
```
dspmv( order, uplo, N, alpha, AP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY )
```

**Ours** `base.js` signature:
```
dspmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY )
```

Key differences:
1. **Missing `order` parameter**: Stdlib passes `order` through to base and
   uses `isRowMajor`/`isColumnMajor` for layout-dependent loop ordering.
   Ours omits `order` entirely.
2. **Extra `strideAP` parameter**: Our base.js has `strideAP` which stdlib
   does not have (stdlib's packed arrays always use stride 1 implicitly).

**Stdlib** uses `@stdlib/ndarray/base/assert/is-row-major-string` and
`@stdlib/ndarray/base/assert/is-column-major-string` to branch on layout.
It also uses `@stdlib/blas/ext/base/dfill` and `@stdlib/blas/base/dscal`
for vector initialization.

**Ours** does not handle layout-dependent ordering in base.js.

---

## [SIGNATURE] ndarray.js -- Missing `order` Parameter

**Stdlib** `ndarray.js` signature:
```
dspmv( order, uplo, N, alpha, AP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY )
```

**Ours** `ndarray.js` signature:
```
dspmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY )
```

**Stdlib** validates `order` (isLayout) as first argument and `uplo` as
second. **Ours** validates `uplo` as first argument (isMatrixTriangle).

The `order` parameter in stdlib's ndarray API is unusual -- most stdlib
ndarray APIs do not take `order`. This is specific to packed-format
routines where the packed storage interpretation depends on the layout.

---

## [SIGNATURE] dspmv.js (Layout Wrapper) -- Missing Validation

Both have matching BLAS-style signatures:
```
dspmv( order, uplo, N, alpha, AP, x, strideX, beta, y, strideY )
```

**Stdlib** validates: order, uplo, N >= 0, strideX != 0, strideY != 0.

**Ours** validates only: order (isLayout). Missing: uplo, N, strideX,
strideY.

---

## [CONVENTION] ndarray.js -- Validation

**Stdlib** validates:
- `order` (isLayout) -- first argument
- `uplo` (isMatrixTriangle) -- second argument  
- `N >= 0` (RangeError)
- `strideX !== 0` (RangeError, eighth argument)
- `strideY !== 0` (RangeError, twelfth argument)

**Ours** validates:
- `uplo` (isMatrixTriangle) -- first argument
- `N >= 0` (RangeError)
- `strideX !== 0` (RangeError, eighth argument)
- `strideY !== 0` (RangeError, twelfth argument)

Missing: `order` validation (the parameter itself is absent).

---

## [CONVENTION] index.js -- Native Addon Loading

**Stdlib** uses `tryRequire`/`isError` pattern.
**Ours** re-exports `./main.js` directly.

---

## [DOCUMENTATION] index.js -- Examples

**Stdlib**: BLAS-style example with expected output values.
**Ours**: ndarray-style example only, no expected output.

---

## [DOCUMENTATION] README.md

**Stdlib**: Both BLAS-style and ndarray APIs documented.
**Ours**: Ndarray API only.

---

## [DOCUMENTATION] docs/types/index.d.ts

**Stdlib**: Both BLAS-style (with `Layout`, `MatrixTriangle` types) and
`ndarray()` signatures. Full JSDoc.

**Ours**: Only ndarray-style. Bare `string` types. No license, no examples.

---

## [TESTING] test/test.js

**Stdlib**: `tape`, split into 3 test files, per-scenario JSON fixtures.
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
| `description` | Full math notation with Unicode | Short generic description |
