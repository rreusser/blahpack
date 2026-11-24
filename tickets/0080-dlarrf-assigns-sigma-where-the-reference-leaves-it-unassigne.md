---
id: 0080
title: dlarrf assigns SIGMA where the reference leaves it unassigned
status: open
area: translation
opened: 2026-11-23
---

## Problem

`dlarrf`'s `base.js` sets `sigma[ 0 ] = 0.0` on entry and assigns `sigma[ 0 ] = sig` when it returns INFO = 1. The reference DLARRF leaves SIGMA unassigned in both cases. That is harmless for callers that follow the reference (SIGMA is undefined on failure), but it is not faithful, and a caller relying on the reference's untouched value would differ.

## Evidence

- `lib/lapack/base/dlarrf/lib/base.js` lines 89, 273, 283. Reported by a wave-2 agent for ticket 0069.

## Reproduce

```bash
grep -n "sigma\[ 0 \]" lib/lapack/base/dlarrf/lib/base.js
```
