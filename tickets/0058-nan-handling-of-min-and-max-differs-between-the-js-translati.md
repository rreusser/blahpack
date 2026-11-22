---
id: 0058
title: NaN handling of MIN and MAX differs between the JS translations and the gfortran reference
status: open
area: base
opened: 2026-11-20
---

## Problem

Fortran's MIN and MAX with a NaN argument are processor-dependent, and gfortran, which generates the reference fixtures, often returns the non-NaN operand. The translations use `Math.min`/`Math.max`, which always propagate NaN. On inputs containing NaN, a JS routine can therefore take a different branch than the reference, and reference paths may be unreachable in JS (or the reverse). No test or check compares NaN behaviour with the reference.

## Evidence

- `dlasq5` computes DMIN with `Math.min`. `dlasq3`'s branch choice (labels 80 vs 90) then depends on whether NaN propagates, so the NaN-input test added for `dlasq3` (2026-11-20, ticket 0045) relies on JS's propagation and says so. A proof in `test/break-mutants.equivalent.json` also relies on it (ticket 0057).
- Likely widespread: `Math.min`/`Math.max` replace MIN/MAX throughout the corpus.

## Reproduce

```bash
grep -rc "Math.min\|Math.max" lib/lapack/base/*/lib/base.js | awk -F: '{s+=$2} END {print s}'
```
