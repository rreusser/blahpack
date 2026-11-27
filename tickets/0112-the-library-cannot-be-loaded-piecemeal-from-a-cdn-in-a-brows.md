---
id: 0112
title: The library cannot be loaded piecemeal from a CDN in a browser: bare @stdlib imports do not resolve
status: open
area: distribution
opened: 2026-11-27
---

## Problem

A browser or notebook user who wants one routine cannot load it from unpkg
or jsDelivr. The source imports stdlib by bare specifier (`@stdlib/...`),
which a browser cannot resolve, and stdlib on npm is CommonJS, which a
browser cannot run even with an import map.

The package now ships a browser build, `dist/` (`bin/build-dist.mjs`, run by
`prepack`): one self-contained ES module per routine plus the vendored stdlib
runtime, checked in CI by `bin/check-dist.mjs`. The problem remains because
the package is not published, so no CDN serves `dist/`, and nothing has
loaded it from a CDN or from Observable.

What is left:

1. Publish this package. Decided (2026-11-27): no throwaway probe package;
   the first real publish is the test.
2. Until then, the published layout is a best guess that covers both ways
   jsDelivr might resolve an extensionless subpath. Notebook Kit rewrites
   `npm:@rreusser/blahpack/lapack/zggev` to
   `https://cdn.jsdelivr.net/npm/@rreusser/blahpack/lapack/zggev/+esm`
   (`@observablehq/notebook-kit`, `dist/src/javascript/imports/npm.js`), and a
   bare specifier is passed to the browser unchanged. The guess:
   - give each `exports` subpath a `browser` condition that points at its
     self-contained `dist/` file;
   - keep `dist/<pkg>/<routine>.js` reachable directly, which a CDN serves as
     a raw file with no conversion.
3. Load the `npm:` import and the direct `dist/` URL in a browser and in an
   Observable notebook, and record whether jsDelivr's `+esm` and esm.sh
   followed the `exports` map.
4. Decide whether `dist/` stays in the main package (it nearly triples the
   npm download) or moves to a separate one: `docs/ndarray-layer.md`, open
   question 5.

## Evidence

- `npm view @rreusser/blahpack` returns 404 from the registry (2026-11-27).
- The source imports 47 distinct stdlib specifiers from 13 packages (esbuild's
  resolution, as `bin/build-dist.mjs` collects them).
- `npm run check:dist` passes: Chromium loads all 902 routines from a local
  server with no request outside `dist/`, and ddot, dgesv, dsyev and dgesvd
  match Node bit for bit. It was shown to fail on a leftover bare import, a
  missing file and a one-ulp change to ddot's result.
- `npm pack`: 6.7 MB, 36.6 MB unpacked, 8,233 files with `dist/`; 2.5 MB,
  23 MB unpacked, 7,383 files before.
- Gzipped sizes: `dist/_stdlib.js` 21.5 KB; ddot 0.6 KB, zggbal 3.2 KB, dgesv
  4.8 KB, zgeev 29 KB, largest (zhegvx) 33.8 KB.
- Shared dependencies are repeated between routine files. The measured cost
  and the alternatives are in `docs/ndarray-layer.md` ("Shared dependencies
  between routines").
- Ticket 0114 sets the per-routine floor.

## Reproduce

```bash
npm view @rreusser/blahpack version 2>&1 | grep -m1 -E "404|^[0-9]"
```
