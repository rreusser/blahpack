---
id: 0114
title: stdlib's BLAS option asserts add about 17 KB gzipped of array constructors to every routine's browser bundle
status: open
area: distribution
opened: 2026-11-27
---

## Problem

The validators `ndarray.js` and `<routine>.js` use for layout and option strings
(`@stdlib/blas/base/assert/is-layout`, `is-transpose-operation`,
`is-matrix-triangle`, `is-operation-side`, `is-diagonal-type`) each reach
`@stdlib/array/base/assert/contains` → `@stdlib/array/dtype`, which imports
every typed-array constructor stdlib has (`Complex128Array`, `Complex64Array`,
`BooleanArray`, …). None of that is needed to test whether a string is one of
two or three literals. As a result the smallest browser bundle of almost any
routine is set by these asserts rather than by its own numerics: zggbal's own
code is 3.4 KB gzipped, but the bundle is 25 KB gzipped. This matters for the
CDN distribution in ticket 0112 and for anyone bundling one or two routines.

## Evidence

- 787 of 915 modules import at least one `@stdlib/blas/base/assert/*` module
  (776 import `is-layout`).
- Each of those five asserts bundles alone (esbuild 0.24, minified, gzipped) to
  about 21.7 KB; they share the same dependency graph.
- The import chain that pulls in `Complex128Array` for zgemm, from esbuild's
  metafile: `lib/blas/base/zgemm` → `@stdlib/blas/base/assert/is-layout` →
  `@stdlib/array/base/assert/contains` → `@stdlib/array/dtype` →
  `@stdlib/array/complex128`.
- Bundled with and without `@stdlib/blas/base/assert/*` (externalized),
  gzipped: zggbal 25.0 KB → 8.0 KB, zgemm 23.7 KB → 6.6 KB.
- `ddot`, which has no option strings, bundles to 4.1 KB.
- Analysis: `docs/ndarray-layer.md` (Distribution).

## Reproduce

```bash
for x in '' '--external:@stdlib/blas/base/assert/*'; do npx -y esbuild@0.24.0 lib/lapack/base/zggbal/lib/index.js --bundle --minify --format=esm --log-level=error $x | gzip -c | wc -c; done
```
