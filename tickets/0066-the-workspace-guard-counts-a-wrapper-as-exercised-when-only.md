---
id: 0066
title: The workspace guard counts a wrapper as exercised when only a throw test reached its null branch
status: open
area: workspace
opened: 2026-11-22
---

## Problem

`bin/workspace-guard.mjs` forces every null-allocated workspace to `null` in every call to the wrapper, including calls in tests that expect a throw. Some of those calls pass validation with junk inputs and reach the allocation. The guard then counts the wrapper as "exercised", although no test checks its results. The "150 exercised, 0 overruns" figure for ticket 0060 (PR #35) is therefore an overstatement of what is verified. The real result checks are the 12 `nullwork` tests and the 30 wrappers whose own tests call them with `null`.

## Evidence

- `dorbdb2` is reported exercised. Its wrapper tests are all argument-error tests (`test.dorbdb2.js` lines 135-170). Its valid-looking calls pass a shared scratch array `X` as every argument.

## Reproduce

```bash
node bin/workspace-guard.mjs dorbdb2
grep -n "dorbdb2( 'column-major'" lib/lapack/base/dorbdb2/test/test.dorbdb2.js
```

## Direction

Count a wrapper as exercised only from tests that pass and do not expect a throw (for example, attribute each allocation to its `node:test` test and drop those whose test contains `assert.throws`). Report the corrected number in tickets 0060 and 0063.
