---
id: 0021
title: Tridiagonal, bidiagonal and triangular-band routines are unvalidated despite available generators
status: open
area: harness
opened: 2026-11-18
---

## Problem

The harness now has `tridiagonal`, `tridiagonalPositiveDefinite` and `triangularBanded` generators (LEARNINGS.md #35 called them missing), but the routines that need them were never validated. There is no bidiagonal generator, so `dbdsqr` and the SVD tail cannot be validated at all.

## Evidence

28 unvalidated routines in the `gt`/`pt`/`st`/`bd`/`tb` families, e.g. `dsteqr`, `dsterf`, `dstebz`, `dstein`, `dstevx`, `dpttrf`, `dpttrs`, `dbdsqr`, `zbdsqr` and `ztbrfs`.

## Reproduce

```bash
grep -nE '^function (tridiagonal|triangularBanded|bidiagonal)' test/harness/logical.js
```
