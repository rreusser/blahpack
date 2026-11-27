---
id: 0123
title: ARPACK's 105 files ship in the npm tarball but cannot be imported: the exports map has no ARPACK entries
status: resolved
area: distribution
opened: 2026-11-27
resolved: 2026-11-27
---

## Problem

`bin/gen-exports.js` lists `lib/` in `files`, so the 13 ARPACK modules under
`lib/arpack/base/` are packed. It builds the exports map from `blas` and
`lapack` only, and Node refuses any subpath an exports map does not list, so
no consumer can import them. No BLAS or LAPACK module imports them either. They
are dead weight in every install, and `dist/` (built from the exports map) has
no ARPACK either.

Decided (2026-11-27): export ARPACK like BLAS and LAPACK, at
`@rreusser/blahpack/arpack/<routine>` once the layout is flattened (ticket
0125). Tickets 0010 and 0043 record that it is not yet validated or
conformance-checked.

## Evidence

- `npm pack --dry-run` lists 105 files under `lib/arpack/` (2026-11-27).
- `bin/gen-exports.js`: `discoverModules( 'blas' )` and
  `discoverModules( 'lapack' )` only.
- No file under `lib/blas` or `lib/lapack` imports `arpack/base`.

## Reproduce

```bash
npm pack --dry-run --json --ignore-scripts 2>/dev/null | node -e 'const j=JSON.parse(require("fs").readFileSync(0))[0];console.log("packed:",j.files.filter(f=>f.path.startsWith("lib/arpack/")).length,"exported:",Object.keys(require("./package.json").exports).filter(k=>k.includes("arpack")).length)'
```

## Resolution

On branch slop/awesome-wright-lxi5gy, bin/gen-exports.js discovers lib/arpack/base/* alongside blas and lapack, so package.json exports ./arpack/base/<routine> for all 13 ARPACK modules (917 export entries), the root index.js re-exports each with its <routine>Ndarray, and dist/ builds them (bin/build-dist.mjs reads the exports map): npm run check:dist loads all 915 routines in Chromium. What prevents a recurrence: the exports map is generated from the lib/ tree, and the package CI job fails if package.json or index.js differ from bin/gen-exports.js's output. The subpath moves to ./arpack/<routine> with the rest when the layout is flattened (ticket 0125).
