---
id: 0123
title: ARPACK's 105 files ship in the npm tarball but cannot be imported: the exports map has no ARPACK entries
status: open
area: distribution
opened: 2026-11-27
---

## Problem

`bin/gen-exports.js` lists `lib/` in `files`, so the 13 ARPACK modules under
`lib/arpack/base/` are packed. It builds the exports map from `blas` and
`lapack` only, and Node refuses any subpath an exports map does not list, so
no consumer can import them. No BLAS or LAPACK module imports them either. They
are dead weight in every install, and `dist/` (built from the exports map) has
no ARPACK either. Whether ARPACK should be published is undecided: tickets 0010
and 0043 record that it is unvalidated and not conformance-checked.

## Evidence

- `npm pack --dry-run` lists 105 files under `lib/arpack/` (2026-11-27).
- `bin/gen-exports.js`: `discoverModules( 'blas' )` and
  `discoverModules( 'lapack' )` only.
- No file under `lib/blas` or `lib/lapack` imports `arpack/base`.

## Reproduce

```bash
npm pack --dry-run --json --ignore-scripts 2>/dev/null | node -e 'const j=JSON.parse(require("fs").readFileSync(0))[0];console.log("packed:",j.files.filter(f=>f.path.startsWith("lib/arpack/")).length,"exported:",Object.keys(require("./package.json").exports).filter(k=>k.includes("arpack")).length)'
```
