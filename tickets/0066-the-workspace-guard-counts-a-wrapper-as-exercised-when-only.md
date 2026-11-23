---
id: 0066
title: The workspace guard counts a wrapper as exercised when only a throw test reached its null branch
status: resolved
area: workspace
opened: 2026-11-22
resolved: 2026-11-23
---

## Problem

`bin/workspace-guard.mjs` forces every null-allocated workspace to `null` in every call to the wrapper, including calls in tests that expect a throw. Some of those calls pass validation with junk inputs and reach the allocation. The guard then counts the wrapper as "exercised", although no test checks its results. The "150 exercised, 0 overruns" figure for ticket 0060 (PR #35) is therefore an overstatement of what is verified. The real result checks are the 12 `nullwork` tests and the 30 wrappers whose own tests call them with `null`.

## Evidence

- `dlangb`'s tests are "is a function", "has expected arity", "throws TypeError for invalid norm" and "throws RangeError for negative N". The guard still reported it exercised, because one of those throw tests reached the allocation.
- In the corpus run on main 738585f4e, 17 of the 420 allocating wrappers are reached only from throw tests or failing tests (`dlaebz`, `zlantr`, `dlangb`, `dlaqr2`, `dtgsja`, `zlansy`, `dlaexc`, `dlaqr3`, ...).
- An earlier draft of this ticket cited `dorbdb2`. That was wrong: it has two end-to-end wrapper tests against Fortran fixtures, and it is genuinely exercised.

## Reproduce

```bash
node bin/workspace-guard.mjs dlangb
grep -n "^test(" lib/lapack/base/dlangb/test/test.dlangb.js
```

## Direction

Count a wrapper as exercised only from tests that pass and do not expect a throw (for example, attribute each allocation to its `node:test` test and drop those whose test contains `assert.throws`). Report the corrected number in tickets 0060 and 0063.

## Resolution

bin/workspace-guard.mjs now wraps every top-level test() in the module's test files (load hook) and counts an allocation as exercised only if it happens inside a test that passes and does not assert a throw. Reached-but-unverified wrappers are reported separately. Corpus rerun on main 738585f4e: 420 allocating wrappers, 132 exercised (was reported 150), 17 reached only from throw or failing tests, 271 never reached, 0 overruns.
