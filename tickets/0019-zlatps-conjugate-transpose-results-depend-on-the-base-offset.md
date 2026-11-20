---
id: 0019
title: `zlatps` conjugate-transpose results depend on the base offset of `AP`
status: open
area: base
opened: 2026-11-18
---

## Problem

With an identical matrix, changing only the base offset of `AP` changes the `zlatps` conjugate-transpose solve by about 1 ULP. A pure change of offset should be bit-exact. The cause was never found. That suggests an addressing-order dependence that could be larger in other inputs, and `zlatps` underlies the whole complex packed condition-estimate family.

## Evidence

- LEARNINGS.md #23 recorded it as "NOT localized" and "NOT fixed".
- LEARNINGS.md #21: `zlatps` previously ignored `strideAP`.
- `zlatps` is not in the validation list.

## Reproduce

```bash
node bin/validation-level.js 2>&1 | grep -w zlatps || echo 'zlatps not validated'
```
