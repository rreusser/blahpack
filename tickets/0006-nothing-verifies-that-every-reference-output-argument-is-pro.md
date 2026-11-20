---
id: 0006
title: Nothing verifies that every reference output argument is produced
status: open
area: conformance
opened: 2026-11-18
---

## Problem

Translations have dropped reference outputs or accepted them as parameters they never write. The signature checks confirm that the parameter *exists*, not that the routine *writes* it, and fixture tests rarely assert secondary outputs.

## Evidence

- `M`, the count of eigenvector columns used, is never written by `dhsein`, `dtgevc`, `dtrevc`, `dtrevc3`, `zhsein`, `ztrevc` or `ztrevc3`. Their JSDoc says so: `(unused, set internally)`, `ignored on entry`.
- LEARNINGS.md #6: `dposvx` dropped the `rcond` output from `base.js`, while its wrapper and docs still advertised it.

## Reproduce

```bash
grep -n '@param.*\bM\b' lib/lapack/base/{dhsein,dtgevc,dtrevc,dtrevc3,zhsein,ztrevc,ztrevc3}/lib/base.js
```
