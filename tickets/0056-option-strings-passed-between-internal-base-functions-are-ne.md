---
id: 0056
title: Option strings passed between internal base functions are never checked against what the callee accepts
status: resolved
area: base
opened: 2026-11-20
resolved: 2026-11-25
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

## Resolution

Resolved with ticket 0022. Every input option parameter's JSDoc type is now the literal union of the values its callee accepts: the spec's enum values, else its `spec/options.json` family. So strict `tsc` (`ci:typecheck`) checks every internal `base.js` call. A string the callee doesn't accept is a type error, and so is a callee comparing against a string it can never receive. That is the per-parameter vocabulary this ticket asked for, enforced by the compiler rather than by a scan.

Found on enabling it:
- `dgges` called `dlascl( 'hessenberg', ... )`, so the Schur form came back still scaled.
- dtgsja/ztgsja dispatched on `'update'` while their validators accepted `'compute-vectors'`.
- dlacpy/dlaset callers used five spellings of "whole matrix".

All are fixed. `lint/typecheck-config.test.cjs` fails if any input option is typed `string`.
