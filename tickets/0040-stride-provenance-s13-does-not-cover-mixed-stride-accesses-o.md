---
id: 0040
title: Stride provenance (S13) does not cover mixed-stride accesses or calls into routines without a spec
status: open
area: lint
opened: 2026-11-20
---

## Problem

The `stride-provenance` lint rule (PR #28) checks that an array is indexed with its own strides at callee boundaries. PR #28 lists, as prose only, what it does not cover yet: an access that mixes two arrays' strides (needs the one-index-variable-per-array convention, "P2" in that PR), calls into routines without a spec, the vendored stdlib error rules, and skill-hygiene lint. The first two are the same silent wrong-answer class the rule exists to catch.

## Evidence

- PR #28 description, "Not covered yet (remaining Step 4)".

## Reproduce

```bash
gh pr view 28 --json body -q .body | grep -n -A5 'Not covered yet'
```
