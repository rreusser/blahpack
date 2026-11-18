---
id: 0009
title: Nothing shows that harness size sweeps reach blocked code paths
status: open
area: harness
opened: 2026-11-18
---

## Problem

Many routines switch algorithm above a hardcoded crossover (NB, NX or NMIN; N > 75 for the `laqr` family). A routine recorded as L3 may never have run its blocked branch, because the validation level records which properties passed, not which branches ran.

## Evidence

- LEARNINGS.md #43: the `zlaqr3` out-of-bounds read hid because every `zhseqr` fixture had N ≤ 6, below every crossover.
- LEARNINGS.md #50: a stale `lwork` was reachable only when M or N > 32.
- LEARNINGS.md #41, LEARNINGS.md #49: workspace under-allocation appeared only on the blocked path.

## Reproduce

```bash
grep -n 'N<=6\|blocked path\|> 32' test/harness/LEARNINGS.md | head
```
