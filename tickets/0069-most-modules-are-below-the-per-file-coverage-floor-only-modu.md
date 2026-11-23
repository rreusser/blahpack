---
id: 0069
title: Most modules are below the per-file coverage floor; only modules a PR changes are gated
status: open
area: tests
opened: 2026-11-23
---

## Problem

CONVENTIONS T4 sets per-file coverage floors: `base.js` ≥ 90% lines and ≥ 85% branches; `<routine>.js` and `ndarray.js` 100%. `ci:coverage` enforces them only on the modules a PR changes, because T5 forbids a baseline. Every other module below the floor keeps untested code: wrapper layout branches, `WORK = null` allocations and validation throws. Ticket 0060's bugs lived in exactly that code, and ticket 0068's still does.

## Evidence

`node bin/coverage.mjs --all --json` on main 738585f4e (912 modules, all tests passing):

| File | At its floor | Note |
|---|---|---|
| `base.js` | 858 at ≥ 90% lines, 812 at ≥ 85% branches | |
| `<routine>.js` | 52 at 100% | median 12 uncovered lines, 90th percentile 28 |
| `ndarray.js` | 119 at 100% | |

- In total, 881 of 912 modules are below the floor in at least one file.
- In 373 of the 426 wrappers with a `WORK = null` branch, that allocation is never reached by a test.
- Uncovered lines include about 2,650 `throw` statements in wrappers and about 3,200 in `ndarray.js`, so their validation paths are untested.
- `npm run conformance:full` (per-file coverage of every module) therefore fails, so it is not in CI.
- Some wrappers are never called with valid inputs at all. For example, `dasum.js` never reaches its `return base( … )`.

## Reproduce

```bash
node bin/coverage.mjs dasum dlarf dpotrf --uncovered
```

## Direction

Batch the backlog in waves of about 4 agents, as with the mutants backlog (ticket 0045). Each wave adds wrapper tests that compare against `ndarray.js` in both orders with `WORK = null` (ticket 0065 makes the scaffold emit these), plus the missing throw tests.
