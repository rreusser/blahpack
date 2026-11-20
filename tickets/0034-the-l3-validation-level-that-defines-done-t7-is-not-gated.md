---
id: 0034
title: The L3 validation level that defines done (T7) is not gated
status: open
area: harness
opened: 2026-11-20
---

## Problem

CONVENTIONS T7 defines a routine as correct only at harness level L3 (layout-fuzzed, bit-exact). `node bin/validation-level.js` reports levels but fails nothing, and CI never runs it, so nothing shows how many routines are below L3 or stops one from regressing. The ledger it reads (`test/.validation-ledger/`) is empty unless the harness tests were just run, so even the report is not reproducible from a clean checkout.

## Evidence

- CONVENTIONS T7 enforcer: "`node bin/validation-level.js`; not gated".
- `.claude/skills/blahpack-validate/SKILL.md:34`: "L3 is the definition of done (CONVENTIONS T7; not yet gated)".
- `node bin/validation-level.js` on a clean checkout: "(ledger empty — run the harness-based tests first)".

- `bin/validation-level.js` reports the highest recorded kind without requiring the lower levels, so a test that records only `layout-invariance` would report L3 for a routine with no property test (PR #28, "Ledger"). Tests avoid recording it for that reason.

## Reproduce

```bash
node bin/validation-level.js | tail -3; grep -n 'validation-level' .github/workflows/ci.yml
```
