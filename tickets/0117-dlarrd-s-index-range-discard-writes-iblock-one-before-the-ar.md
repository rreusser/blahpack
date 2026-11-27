---
id: 0117
title: DLARRD's index-range discard writes IBLOCK one before the array when no candidate is left, and the JS copies it
status: open
area: reference
opened: 2026-11-27
---

## Problem

DLARRD trims the RANGE = 'I' candidates at labels 90 and 110 of `data/lapack-3.12.0/SRC/dlarrd.f`. Each discard pass starts with IW = 0 and then sets IBLOCK( IW ) = 0. When no entry with IBLOCK ≠ 0 is left, IW stays 0 and the reference writes IBLOCK(0), one element before the array. That happens at M = 0, or when every entry has already been discarded, which ties across blocks can cause.

`lib/lapack/base/dlarrd/lib/base.js:411` and `:427` copy this with `iw = -1`, so the JS writes `IBLOCK[ offsetIBLOCK - strideIBLOCK ] = 0`. That is a no-op when `offsetIBLOCK = 0`, but with `offsetIBLOCK > 0` it overwrites the caller's element just before the vector.

## Evidence

- **Input:** RANGE = 'I', ORDER = 'E', N = 6, IL = IU = 5, D = [ 3, 2, 2, 0.5, -1, 0.5 ], E = [ 0, 1, 0, -1, 1, 0 ], ISPLIT = [ 1, 3, 6 ], RELTOL = 8·EPS, PIVMIN = 1e-3. GERS holds the blocks' Gershgorin intervals.
- **In the Fortran harness:** the out-of-bounds write corrupted the adjacent WU variable, which came back as 2.2e-315. This input was therefore left out of the ticket-0110 fixtures.
- **Found by:** the ticket-0110 triage of dlarrd, 2026-11-27.

## Reproduce

```bash
grep -n "iw = -1\|IBLOCK\[ offsetIBLOCK + ( iw" lib/lapack/base/dlarrd/lib/base.js | head
```

## Direction

This needs a decision. Either keep the reference's behaviour, or guard `iw !== -1` in the JS. The guard would be a deviation, recorded in `DIFFERENCES.md` (X6), whose only effect is to avoid the reference's out-of-bounds write.
