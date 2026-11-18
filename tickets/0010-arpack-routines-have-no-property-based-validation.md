---
id: 0010
title: ARPACK routines have no property-based validation
status: open
area: harness
opened: 2026-11-18
---

## Problem

None of the 13 ARPACK modules is in the harness. Their correctness rests on fixtures only, so a wrong Ritz pair or a loss of orthogonality would go undetected.

## Evidence

`node bin/validation-level.js` lists no routine from `lib/arpack`.

## Reproduce

```bash
for r in $(ls lib/arpack/base); do node bin/validation-level.js 2>&1 | grep -qw $r && echo "$r validated"; done; echo done
```
