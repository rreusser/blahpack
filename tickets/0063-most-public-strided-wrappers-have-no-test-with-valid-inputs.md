---
id: 0063
title: Most public strided wrappers have no test with valid inputs, so their null-workspace path never runs
status: open
area: wrappers
opened: 2026-11-22
---

## Problem

A `<routine>.js` wrapper owns the convenience layer: `order` and leading-dimension handling, and allocating workspaces when the caller passes `null` (CONVENTIONS D5c). For most routines, `test/test.<routine>.js` only checks that invalid arguments throw. No test calls the wrapper with valid inputs, so its null-workspace allocation and its row-major mapping never run. A wrong allocation or a wrong stride mapping in the wrapper passes every test. The ticket 0060 bugs (length-1 workspaces returning NaN) survived for exactly this reason.

## Evidence

- `node bin/workspace-guard.mjs --all` (ticket 0060), on the branch that resolves 0060: 420 wrappers allocate a workspace when given `null`. Their own tests reach that allocation in only 150. The other 270 are reported `unexercised`, so the `ci:workspace` gate cannot check them until a test calls them.
- The 11 wrappers fixed under ticket 0060 had no valid-input wrapper test. Each now has a null-vs-ample workspace test (`test/harness/nullwork.js`).
- The gate reports unexercised wrappers but does not fail on them, because failing would block every unrelated change to those 270 modules.

## Reproduce

```bash
node bin/workspace-guard.mjs --all | grep -c unexercised
```
