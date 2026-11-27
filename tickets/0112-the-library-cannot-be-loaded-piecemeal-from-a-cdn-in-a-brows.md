---
id: 0112
title: The library cannot be loaded piecemeal from a CDN in a browser: bare @stdlib imports do not resolve
status: open
area: distribution
opened: 2026-11-27
---

## Problem

A browser user who wants one routine has no way to load just that routine from
unpkg or jsDelivr. Imports between this library's own modules are relative and
would resolve against a CDN URL. The modules also import `@stdlib/...` by bare
specifier, which a browser cannot resolve without an import map. Even with
one, loading stdlib unbundled means hundreds of module requests per routine.
There is no prebuilt browser `dist/`. The only alternatives are to install from
npm and run a bundler, or to import the root `index.js`, which pulls in the
whole library. Nothing records whether jsDelivr's `+esm` or esm.sh rewriting
works on this package.

## Evidence

- 43 distinct bare `@stdlib/...` specifiers are imported from
  `lib/{blas,lapack}/base/*/lib/*.js`.
- esbuild's metafile for zggbal lists 277 input modules, 265 of them stdlib.
- No `dist/` directory, and `package.json` has no `sideEffects` field.
- Sizes measured with esbuild 0.24 (minified, gzipped):
  - **Per-routine standalone bundles:** ddot 4 KB, zggbal 25 KB, dgesv 27 KB,
    dgesvd 45 KB, zgeev 53 KB, root `index.js` 680 KB.
  - **Global code-splitting over all 915 entries:** 642 chunks, and 29 requests
    (zggbal) to 91 requests (zgeev) per routine. Too fragmented to serve.
  - **One shared runtime plus one file per routine:** the runtime holding all
    43 stdlib imports is 36 KB; the routines' own code with stdlib external is
    ddot 0.6 KB, zggbal 3.4 KB, dgesvd 23 KB, zgeev 30 KB. Two requests per
    routine, with the runtime cached across routines.
- `npm pack --dry-run`: tarball 2.5 MB, 23 MB unpacked, 7,383 files.
  The 145 MB of `lib/` on disk (57 MB apparent) is mostly tests, fixtures,
  docs and per-file block overhead, which `files` already excludes.
- Ticket 0110 sets the per-routine floor. Full analysis:
  `docs/ndarray-layer.md` (Distribution).

## Reproduce

```bash
ls dist; grep -hoE "from '@stdlib/[^']+'" lib/blas/base/*/lib/*.js lib/lapack/base/*/lib/*.js | sort -u | wc -l
```
