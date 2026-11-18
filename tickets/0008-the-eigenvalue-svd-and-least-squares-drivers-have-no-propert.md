---
id: 0008
title: The eigenvalue, SVD and least-squares drivers have no property-based validation
status: open
area: harness
opened: 2026-11-18
---

## Problem

The routines users call directly are outside the validation harness. Yet every silent wrong answer found so far went through them: `dgeev`/`zgeev` above N = 75, `zhseqr`, `zggsvd3` and `dtrsna`. Fixture tests at small N exercise neither their blocked paths nor their workspace plumbing.

## Evidence

`node bin/validation-level.js` lists none of `dgeev`, `zgeev`, `dgees`, `dggev`, `dgesvd`, `dsyev`, `dsyevr`, `zheev`, `dgelss`, `dbdsqr`, `dhseqr`, `dlaqr0` or `dlasq2`. 271 of 825 LAPACK routines are validated; all 74 BLAS routines are.

## Reproduce

```bash
node bin/validation-level.js 2>&1 | grep -wE 'dgeev|zgeev|dgesvd|dsyev|zheev|dhseqr' || echo 'none validated'
```
