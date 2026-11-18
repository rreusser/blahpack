---
id: 0004
title: No CI check fails on a call with the wrong number of arguments
status: open
area: ci
opened: 2026-11-18
---

## Problem

`base-arity` covers only `ndarray.js`/wrapper → `base()`. Calls from one `base.js` into a dependency are checked only by `tsc`, which is not in `npm test`, conformance or CI. Test files are outside both `tsc` and ESLint. Every signature change (dropping `lwork`, removing a vestigial output) has left callers behind with silently shifted arguments. The resulting failures often appear only on blocked, large-N paths.

## Evidence

- LEARNINGS.md #44: `dtrsna`, where a vestigial `M` shifted the workspace arguments.
- LEARNINGS.md #45: 15 more cases of forwarding an output parameter.
- LEARNINGS.md #48: `ztgsen`/`ztgsyl` tests ran with scrambled workspace arguments.
- LEARNINGS.md #50: `ztgsna` passed a stale `lwork`, so `IWORK` received `-1`; only the blocked path was affected.
- LEARNINGS.md #51: the one-off `tsc` sweep found more stale signatures.
- `.github/workflows/ci.yml` has no `tsc` step, and `tsconfig.json` `include` has no test files.

## Reproduce

```bash
grep -n 'tsc\|typecheck' .github/workflows/ci.yml; grep -A3 '"include"' tsconfig.json
```
