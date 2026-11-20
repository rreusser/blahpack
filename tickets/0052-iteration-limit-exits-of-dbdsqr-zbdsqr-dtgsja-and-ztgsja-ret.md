---
id: 0052
title: Iteration-limit exits of dbdsqr, zbdsqr, dtgsja and ztgsja return different outputs than the reference
status: open
area: base
opened: 2026-11-20
---

## Problem

When these routines fail to converge (`info > 0`), their outputs differ from reference LAPACK 3.12:

- `dbdsqr`/`zbdsqr`: on the iteration-limit exit (Fortran `GO TO 200`), the reference only counts the nonzero `E` entries into INFO and returns D unsorted, with signs unchanged. The sort and sign fix-up (lines 817–847) end in `GO TO 220` and are skipped. The JS calls `sortSingularValues(...)` on that path too, so it returns D sorted and non-negative, with VT, U and C swapped or negated.
- `dtgsja`/`ztgsja`: on non-convergence the reference sets `NCYCLE = KCYCLE` at label 100. After the DO loop runs out, that is MAXIT + 1 = 41. The JS sets `ncycle[0] = kcycle - 1` = 40. A JS `for` loop also exits with the index at MAXIT + 1, so the `- 1` "corrects" a value that was already right.

What allowed it: iteration-limit paths are not exercised by any test (ticket 0051), so nothing compares these outputs with the reference. The `dtgsja` deviation also hand-adjusts a loop-exit index. The reference's DO-loop exit value equals the JS `for` loop's, so any such adjustment is suspect. Other routines that report a cycle or iteration count from a loop index may have the same adjustment.

## Evidence

- `data/lapack-3.12.0/SRC/dbdsqr.f`: `GO TO 200` (line 446), sort ending `GO TO 220` (817–847), label 200 (851–856).
- `data/lapack-3.12.0/SRC/dtgsja.f`: label 100 `NCYCLE = KCYCLE` (647–648).
- Found by break-mutant triage (ticket 0045, wave 2).

## Reproduce

```bash
sed -n 851,857p data/lapack-3.12.0/SRC/dbdsqr.f
grep -n "sortSingularValues" lib/lapack/base/dbdsqr/lib/base.js
grep -n "ncycle\[ 0 \] = kcycle" lib/lapack/base/dtgsja/lib/base.js lib/lapack/base/ztgsja/lib/base.js
```
