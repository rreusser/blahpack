---
id: 0031
title: Seven rules still have the duplicate enforcers Step 3 was to delete
status: open
area: conformance
opened: 2026-11-20
---

## Problem

CONVENTIONS.md marks a second enforcer for the same rule **(dup)** and says "It gets deleted in Step 3". Step 3 merged (PR #27) and the duplicates remain. Two checks for one rule can disagree, and each one is maintenance that buys nothing.

## Evidence

CONVENTIONS rows marked (dup), with the conformance check that duplicates the lint rule:
- D4: `conf:workspace.no-internal-alloc` (dup of `lint:no-internal-workspace-alloc`)
- W1: `conf:workspace.naming`, LWORK half (dup of `lint:no-lwork-param`)
- N2: `conf:strings.no-dprefix-conjtrans` (dup of `lint:no-dprefix-conjugate-transpose`)
- N3: `conf:strings.no-single-char-param` (dup of `lint:jsdoc-backtick-params`)
- C2: `conf:complex.reinterpret` (dup of `lint:z-prefix-reinterpret`)
- J4: `conf:scaffolding.no-stub-wrappers` (dup of `lint:no-stub-wrappers`)
- T2: `conf:tests.no-scaffold-markers` (dup of `conf:scaffolding.no-assert-fail`)

## Reproduce

```bash
grep -n '(dup' CONVENTIONS.md
```
