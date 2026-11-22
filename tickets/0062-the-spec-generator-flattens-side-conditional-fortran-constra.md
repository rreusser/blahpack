---
id: 0062
title: The spec generator flattens SIDE-conditional Fortran constraints into one side-independent rule
status: open
area: spec
opened: 2026-11-22
---

## Problem

Many reference routines document a workspace size or a leading-dimension rule that depends on SIDE (or a similar flag): `(N) if SIDE = 'L' or (M) if SIDE = 'R'`. `bin/spec-gen/build.cjs` keeps only one branch, so `spec/<routine>.json` records a single side-independent value. Everything projected from the spec inherits the error: `minLength.js` (the workspace minimum a D5c allocation should use), the JSDoc, and the generated prologue LD checks. The wrong value is invisible until a call takes the other branch, because nothing compares the spec with the conditional reference text.

## Evidence

- `spec/dlarf.json` WORK: `minLength.js = "N"`. The reference (`dlarf.f:107-109`) says `(N) if SIDE = 'L' or (M) if SIDE = 'R'`. A null-WORK allocation from the spec would be too small for `side = 'right'` with M > N (ticket 0060).
- `spec/dtprfb.json` WORK: `dims = [LDWORK, N]`. The reference (`dtprfb.f:176-188`) says `(LDWORK,N) if SIDE = 'L', (LDWORK,K) if SIDE = 'R'`, and `LDWORK >= K` (L) or `>= M` (R). `dtprfb.js` checks the side-independent `LDWORK >= max(1,M)` and `LDT >= max(1,M)` (column-major), so a valid left-side call with K < M and `LDWORK = K` is rejected, and the T check uses M where T is K-by-K.
- The ticket 0060 fixes (`dlarf`, `dopmtr`, `dorm2l`, `dorm2r`, `dorml2`, `dormr2`, `dormr3`, `dtpmqrt`, `dtprfb`, `zgemqrt`) take the SIDE-conditional size from the reference by hand, which the spec does not reflect.

## Reproduce

```bash
grep -n -A3 "WORK is DOUBLE PRECISION array, dimension" data/lapack-3.12.0/SRC/dlarf.f
node -e 'const s=require("./spec/dlarf.json");console.log(s.params.find(p=>p.name==="WORK").minLength)'
```
