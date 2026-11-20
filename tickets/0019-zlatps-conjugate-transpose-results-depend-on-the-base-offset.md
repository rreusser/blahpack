---
id: 0019
title: `zlatps` conjugate-transpose results depend on the base offset of `AP`
status: resolved
area: base
opened: 2026-11-18
resolved: 2026-11-18
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

## Resolution

Root cause: the lower CNORM loop counted offsetAP twice (ip = offsetAP*2, then offsetAP + ip/sap + 1), so a nonzero offset fed wrong column norms into the careful path; fixed incidentally by 549b87df (pre-fix zlatps fails 1,950 stride-1 offset cases, current 0 of 8,400). zlatps now has harness validation (test.validate.js, L3) that compares x, scale and CNORM bit-exactly across packed offsets and positive strides on both the fast and the forced careful path, chaining normin='no' into normin='yes' as *ppcon does, so a recurrence fails. That validation also found and fixed a GO TO-as-break bug in the growth bound of all six *latrs/*latps/*latbs routines (LEARNINGS 2026-11-18). Negative strides are tracked separately in 0026.
