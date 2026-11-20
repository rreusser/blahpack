---
id: 0041
title: 335 of 912 module examples throw, and nothing runs them
status: open
area: docs
opened: 2026-11-20
---

## Problem

`examples/index.js` is the first code a user copies, and no test, lint rule or CI step executes it. Signature changes (PRs #19–#28) and older scaffold mistakes left about a third of them throwing. PR #26 noted in prose that "some examples were already broken (wrong argument counts)" and that its codemod left the extra arguments in place.

## Evidence

`node lib/<pkg>/base/<r>/examples/index.js` for all 912 modules on main `0be7ea7c8`: 335 exit nonzero (37 blas, 298 lapack). First error per file:
- 161 `RangeError: Invalid typed array length`, mostly a complex array built with the wrong length, e.g. `lib/blas/base/dzasum/examples/index.js` (thrown inside `reinterpret`);
- 38 `Cannot create property ... on number` (a number passed where an output array now goes, the S10 change);
- 16 workspace too short; about 43 option or dimension validation errors;
- 14 `ERR_MODULE_NOT_FOUND` and 14 missing named exports (broken imports).

## Reproduce

```bash
ls lib/*/base/*/examples/index.js | xargs -P 8 -I{} sh -c 'timeout 10 node {} >/dev/null 2>&1 || echo {}' | wc -l
```
