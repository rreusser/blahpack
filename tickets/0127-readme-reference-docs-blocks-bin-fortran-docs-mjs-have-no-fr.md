---
id: 0127
title: README reference-docs blocks (bin/fortran-docs.mjs) have no freshness check: CI lacks the Fortran sources
status: resolved
area: general
opened: 2026-11-27
resolved: 2026-11-27
---

## Problem

`node bin/fortran-docs.mjs --readme --all` writes each module README's
reference-documentation block (between `<!-- fortran-docs:start ... -->` and
`<!-- fortran-docs:end -->`) from the reference Fortran in `data/`. Those
sources are gitignored and CI never fetches them, so nothing checks that the
committed blocks match what the current converter produces. A converter change
that is not followed by a local `--readme --all` leaves stale blocks, and a
hand edit inside a block goes unnoticed.

## Evidence

- `.github/workflows/ci.yml` has no step that runs `bin/fetch-reference.sh`.
- 901 READMEs carry a block; none is regenerated in CI.

## Reproduce

```bash
node bin/fortran-docs.mjs --readme --all   # locally, with data/ populated: "0 written" when fresh
```

A fix is either a `--check` mode run in a CI job that fetches the sources
(`bin/fetch-reference.sh`, or a shallow git clone of the v3.12.0 tag where the
netlib tarball is blocked), or a lint rule that rejects edits inside the block.

## Resolution

Module READMEs are now generated whole by bin/docs/readme.js from committed inputs (JSDoc, spec, data/fortran-routine-docs.json, examples/index.js), and CI runs npm run readme:check, so a stale README fails CI. The data files themselves are refreshed at developer time by bin/gen_spec --extract, like data/fortran-checks.json (CONVENTIONS T6).
