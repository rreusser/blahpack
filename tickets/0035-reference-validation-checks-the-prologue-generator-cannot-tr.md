---
id: 0035
title: Reference validation checks the prologue generator cannot translate are hand-written and unchecked
status: open
area: spec
opened: 2026-11-20
---

## Problem

The generated validation prologue covers the reference argument checks the generator can translate. The rest (locals defined on only some paths, `ILATRANS`, the `BALANC`/`SENSE` families) stay as hand-written checks after the prologue, and no lint rule compares them with the reference. Separately, the index base of scalar index arguments is not a convention: S12 covers index arrays only, so a scalar index may be 0- or 1-based per routine.

## Evidence

- `docs/enforcement-architecture.md`, Step 3 result, "Open (not gated)".

- Some of the hand-written checks are invented, with no reference counterpart: `dlaqz4`, `dlamswlq`, `dlamtsqr` (PR #27, "Follow-ups").

## Reproduce

```bash
grep -n -A3 'Open (not gated)' docs/enforcement-architecture.md
```
