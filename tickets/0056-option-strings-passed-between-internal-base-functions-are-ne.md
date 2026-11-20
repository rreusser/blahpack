---
id: 0056
title: Option strings passed between internal base functions are never checked against what the callee accepts
status: open
area: base
opened: 2026-11-20
---

## Problem

Public wrappers validate option strings, but `base.js` functions call each other directly and nothing checks those calls. Base functions usually test one value (`norm === 'inf-norm'`) and treat everything else as another branch or a default. So a misspelled option in an internal call runs the wrong computation silently. Line coverage cannot notice, and fixture tests only notice when the wrong branch happens to change the checked outputs.

## Evidence

- `dhsein` called `dlanhs( 'infinity', ... )`; `dlanhs` accepts `'inf-norm'`, so it returned 0. EPS3 was therefore always SMLNUM instead of ||H||·ULP: equal selected eigenvalues were never perturbed apart, and could loop forever. Fixed 2026-11-20 (LEARNINGS). Found by break-mutant triage, not by any check.
- A naive scan (string literals passed to imported `base.js` callees, compared with the literals each callee tests) reports about 2,100 hits. Nearly all are false positives, because callees test one value and default the rest. A real check needs each callee's accepted vocabulary per parameter. The spec layer (`lint/lib/spec.cjs`) records which parameters are flags but not their values.
- Related: ticket 0022 (public option arguments that are never validated).

## Reproduce

```bash
git log --oneline -S"dlanhs('infinity'" -- lib/lapack/base/dhsein/lib/base.js
```
