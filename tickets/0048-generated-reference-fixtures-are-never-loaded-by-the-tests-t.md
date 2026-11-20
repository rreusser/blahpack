---
id: 0048
title: Generated reference fixtures are never loaded by the tests that should check against them
status: open
area: harness
opened: 2026-11-18
---

## Problem

Fixture files are generated from the reference Fortran for exactly the cases a routine's tests should check, but nothing verifies that the tests load them. When they don't, a whole code path can go untested while the fixture's existence suggests it is covered.

## Evidence

- `dlaein`: `right_complex_noinit_4x4` and `left_complex_noinit_4x4` existed, but the module had no complex-eigenvalue test at all. That hid untested break semantics (tickets/0045) and a row-major leading-dimension bug in the test helper, which only the complex path exercises. Five more `dlaein` fixtures are still unused.
- `dlaqr4`: `40x40_wantt_wantz.json` and `80x80_wantt_wantz.json` are never imported. They would have shown the Schur-order deviation in tickets/0046.
- Rough corpus scan: 849 of 6,740 per-module fixture files are not referenced by file name in their module's tests, in 200 of 656 modules. This OVERCOUNTS. Some modules (e.g. `zlanhf`) read the global `test/fixtures/<routine>.jsonl`, which makes their per-module files stale duplicates rather than missing coverage. Others, e.g. `dtbcon` (16 files, none referenced), appear genuinely unused. The two still need to be separated per fixture case.

## Reproduce

```bash
ls lib/lapack/base/dtbcon/test/fixtures | wc -l
grep -c "fixtures" lib/lapack/base/dtbcon/test/*.js
grep -c "40x40_wantt_wantz" lib/lapack/base/dlaqr4/test/*.js
```
