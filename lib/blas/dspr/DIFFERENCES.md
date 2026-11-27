# dspr: Differences from stdlib-js Reference

Comparison of our translation (`lib/blas/base/dspr/`) against the stdlib-js
reference (`@stdlib/blas/base/dspr`).

---

## [STRUCTURAL] Missing Files

- `benchmark/benchmark.js`, `benchmark/benchmark.ndarray.js`
- `docs/types/test.ts`
- `test/test.dspr.js` (BLAS-style tests)
- `test/test.ndarray.js`
- `test/fixtures/` (18 individual JSON fixture files)

Our module has `LEARNINGS.integrated.md` (not in stdlib).

---

## [SIGNATURE] dspr.js (Layout Wrapper) -- Completely Different Signature

**Stdlib** BLAS-style signature:
```
dspr( order, uplo, N, alpha, x, strideX, AP )
```

**Ours** layout wrapper signature:
```
dspr( uplo, N, alpha, x, strideX, AP, strideAP )
```

Key differences:
1. **Missing `order` parameter**: Our layout wrapper does not accept a
   storage layout argument. This is a BLAS-style API that must accept
   `order` as the first argument.
2. **Extra `strideAP` parameter**: Our wrapper takes `strideAP` which
   the BLAS-style API does not use (packed arrays always have stride 1).
3. **Missing validation**: Stdlib validates order, uplo, N >= 0,
   strideX != 0. Ours has no validation in the layout wrapper.

---

## [SIGNATURE] base.js -- Missing `order` Parameter

**Stdlib** `base.js` signature:
```
dspr( order, uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP )
```

**Ours** `base.js` signature:
```
dspr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP )
```

Stdlib passes `order` through and uses `isRowMajor`/`isColumnMajor` to
determine the packed storage interpretation. Our implementation omits
the `order` parameter.

---

## [SIGNATURE] ndarray.js -- Missing `order` Parameter and Validation

**Stdlib** `ndarray.js` signature:
```
dspr( order, uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP )
```

**Ours** `ndarray.js` signature:
```
dspr( uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP )
```

**Stdlib** validates:
- `order` (isLayout)
- `uplo` (isMatrixTriangle)
- `N >= 0` (RangeError)
- `strideX !== 0` (RangeError, sixth argument)
- `strideAP !== 0` (RangeError, ninth argument)

**Ours** validates only:
- `uplo` (isMatrixTriangle)

Missing: `order` validation, `N >= 0`, `strideX !== 0`, `strideAP !== 0`.

---

## [CONVENTION] index.js -- Missing License Header

**Ours** index.js is missing the Apache-2.0 license header comment block.
The `@example` block has a `// TODO: Add example` placeholder.

**Stdlib** has full license header and complete examples.

---

## [CONVENTION] index.js -- Native Addon Loading

**Stdlib** uses `tryRequire`/`isError` pattern.
**Ours** re-exports `./main.js` directly.

---

## [CONVENTION] dspr.js -- Missing License/JSDoc

**Ours** dspr.js layout wrapper has a minimal `@license Apache-2.0` tag
inside a JSDoc block with bare parameter descriptions (e.g., `@param
{string} uplo - uplo`). Missing proper descriptive JSDoc.

**Stdlib** has full license header and comprehensive JSDoc with examples
and `@throws` annotations.

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
| `description` | Unicode math notation | Short generic description |
