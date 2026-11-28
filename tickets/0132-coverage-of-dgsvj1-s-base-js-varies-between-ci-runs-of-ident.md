---
id: 0132
title: Coverage of dgsvj1's base.js varies between CI runs of identical code: 78% in one, above its 90% floor in the next
status: open
area: ci
opened: 2026-11-28
---

## Problem

The coverage gate (`node bin/coverage.mjs --changed --check --uncovered`)
gave two different answers for the same `lib/lapack/dgsvj1/lib/base.js`. It
passed in one CI run and failed in the next, with 78.2% of lines (floor 90)
and 79.2% of branches (floor 85). The uncovered lines are whole blocks
(199–216, 237–249, 317–409, 427–439), as if some of the module's tests ran
without their coverage being recorded. A gate that fails at random on
unchanged code teaches people to rerun it until it passes, and hides a real
coverage drop when one happens.

## Evidence

- PR #72, CI run 46060592157 (commit a3bf5b0): the Coverage job passed with
  all 915 modules in scope.
- PR #72, CI run 46085729391 (commit 7de39de, which changed only
  `bin/value-mutants.mjs` and its test): `BELOW lib/lapack/dgsvj1/lib/base.js
  lines 78.2% (min 90), branches 79.2% (min 85)`; "915 modules, 1 below
  threshold".
- Locally (Node 22), `node bin/coverage.mjs dgsvj1 --check --no-cache` passes
  three times out of three. CI uses Node 24. The module's tests take 0.16 s,
  far below the tool's 10-minute spawn timeout.
- `bin/coverage.mjs` runs the tests with `--experimental-test-coverage` and the
  concurrency from `testConcurrency()`; whether concurrent test files'
  coverage is merged reliably on Node 24 is unchecked.

## Reproduce

```bash
for i in 1 2 3 4 5; do node bin/coverage.mjs dgsvj1 --check --no-cache 2>&1 | tail -1; done
```
