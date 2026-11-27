---
id: 0128
title: ARPACK modules have no reference-docs block: bin/fortran-docs.mjs parses only Doxygen prologues
status: open
area: general
opened: 2026-11-27
---

## Problem

`bin/fortran-docs.mjs` reads the Doxygen `*>` prologue of the reference
BLAS/LAPACK sources. ARPACK documents its routines in `c\BeginDoc ... c\EndDoc`
blocks instead, and its sources (`data/arpack-ng-3.9.1`) are a separate fetch,
so the 13 ARPACK modules get no reference-documentation block in their README
or on the docs site. `zlansf` also has none: LAPACK 3.12.0 has no `zlansf.f`
(the complex RFP norm is `zlanhf`).

## Evidence

`node bin/fortran-docs.mjs --readme --all` reports 14 modules "without a
reference source": dgetv0, dsaitr, dsapps, dsaup2, dsaupd, dsband, dsconv,
dseigt, dsesrt, dseupd, dsgets, dsortr, dstqrb, zlansf.

## Reproduce

```bash
node bin/fortran-docs.mjs --readme --all --report
```
