---
id: 0065
title: The wrapper test scaffold emits only shape and throw tests, and valid-input tests pass oversized workspaces
status: open
area: wrappers
opened: 2026-11-22
---

## Problem

`bin/scaffold.py` (around line 654) generates `test/test.<routine>.js` with only "is a function", arity and "throws on bad argument" tests. Nothing later adds a valid-input call. Where valid-input wrapper tests do exist, they usually pass an oversized caller workspace (for example `ztgsen`'s `new Complex128Array( 64 )`), so the wrapper's own size calculation never runs. All correctness testing (fixtures, harness, layout fuzzing) targets `ndarray.js`/`base.js`, so a wrapper's own logic (null-workspace allocation, `order`/LD mapping) is untested by construction.

## Evidence

Across the 420 wrappers that allocate a workspace on `null`, the test blocks in `test.<routine>.js` on main before ticket 0060's fix:

- 299: only shape and throw tests;
- 91: valid calls, but always with a caller workspace;
- 30: at least one valid call with `null`.

`dlarf`'s six tests were the unchanged template. The ticket 0060 bugs went unnoticed in all 15 wrappers.

## Reproduce

```bash
grep -n "test_lines.append" bin/scaffold.py | head
git show d52a3a15b~1:lib/lapack/base/dlarf/test/test.dlarf.js | grep "^test("
```

## Direction

The scaffold should emit a wrapper test that replays a fixture case through `<routine>.js` with every workspace `null`, and compares it bit-exactly with `ndarray.js` on the same inputs. That checks both the allocation and the `order`/LD mapping (`test/harness/nullwork.js` is the null-vs-ample half). The backlog is the 390 wrappers without a `null` test; related to ticket 0063.
