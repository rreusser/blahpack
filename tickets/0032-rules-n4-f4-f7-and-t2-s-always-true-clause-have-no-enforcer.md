---
id: 0032
title: Rules N4, F4, F7 and T2's always-true clause have no enforcer
status: open
area: conventions
opened: 2026-11-20
---

## Problem

CONVENTIONS.md says "A rule with no named enforcer is a defect in this file." These rules, or parts of them, are marked **(unbuilt)**: nothing checks them, so a violation lands unnoticed.

## Evidence

- N4: ESM only, `const`/`let`, deep imports — "(unbuilt; Step 4 ESM-style rule)".
- F4: every source file starts with the `@license MIT` header — "(unbuilt)" (912/912 comply today, by accident).
- F7: module path mirrors its reference package — "(unbuilt; path ↔ `data/` package check)".
- T2: no always-true asserts — "always-true (unbuilt)".

## Reproduce

```bash
grep -n -E '\| (N4|F4|F7|T2) \|' CONVENTIONS.md | grep -o 'unbuilt[^|]*'
```
