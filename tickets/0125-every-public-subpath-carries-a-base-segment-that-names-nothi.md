---
id: 0125
title: Every public subpath carries a base/ segment that names nothing a user chooses between
status: resolved
area: distribution
opened: 2026-11-27
resolved: 2026-11-27
---

## Problem

Every module lives at `lib/<pkg>/base/<routine>/` and is exported as
`@rreusser/blahpack/<pkg>/base/<routine>`. In stdlib, `base` separates the
strided kernels from a top-level ndarray API at `<pkg>/<routine>`. Here
nothing sits beside `base`, so the segment lengthens every import and every
CDN URL without telling the user anything. It also suggests the import
returns a bare kernel, which it does not: the default export is the
validated layout form, and `base.js` is never public.

The package is unpublished, so the paths can change without compatibility
aliases. The migration plan (`docs/ndarray-layer.md`, "Migration plan")
flattens them to `lib/<pkg>/<routine>/` and `@rreusser/blahpack/<pkg>/<routine>`,
with the opt-in ndarray-object form at `<pkg>/<routine>/ndarray` (ticket 0111).

## Evidence

- `package.json` exports: 902 subpaths of the form `./<pkg>/base/<routine>`,
  and none at `./<pkg>/<routine>`.
- What hard-codes the segment (2026-11-27): 846 cross-module relative imports
  in `lib/`; about 1,180 README and example files that show
  `@rreusser/blahpack/<pkg>/base/...`; 49 files under `bin/`, 155 under
  `lint/` (mostly fixtures), 8 under `test/harness/`, the CI workflow,
  `CONVENTIONS.md` and 7 docs.
- Any branch that touches `lib/` conflicts with the rename, so it needs a
  rerunnable codemod that other branches can apply to themselves.

## Reproduce

```bash
node -p 'Object.keys(require("./package.json").exports).filter((k) => /\/base\//.test(k)).length'
```

## Resolution

On branch slop/awesome-wright-lxi5gy, bin/codemod-flatten.mjs moved every module from lib/<pkg>/base/<routine>/ to lib/<pkg>/<routine>/ and rewrote every reference: relative paths re-resolved against the old layout, written-out paths, package names and subpaths (./<pkg>/<routine>), tooling path-building forms, and module package.json names (which also renamed the 16 modules named @stdlib/...; ticket 0131). dist/ files are dist/<pkg>/<routine>.js. lib/<pkg>/ holds only module directories (lib/arpack/README.md moved to docs/arpack-provenance.md; the empty lib/{blas,lapack}/package.json files are gone). What prevents a recurrence: the CI lint job runs node bin/codemod-flatten.mjs --check, which fails on any lib/<pkg>/base/ directory, any non-module entry in lib/<pkg>/, and any text or tooling form that still names the old layout; the codemod is rerunnable, so a branch from before the flatten applies it to itself.
