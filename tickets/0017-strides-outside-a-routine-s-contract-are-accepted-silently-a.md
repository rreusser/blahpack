---
id: 0017
title: Strides outside a routine’s contract are accepted silently and produce garbage
status: open
area: wrappers
opened: 2026-11-18
---

## Problem

Some strides are out of contract by inheritance from reference BLAS. `IDAMAX`/`IZAMAX` return no index for `INCX ≤ 0`, so any pivoting factorization given a negative first-dimension stride reads out of bounds and returns `info = 0`. The wrappers accept such strides without complaint, so the caller gets a wrong answer and no error.

## Evidence

- LEARNINGS.md #28: `dgetrf` with `strideA1 < 0` gives `IPIV = -1`, out-of-bounds swaps and `info = 0`. The same holds for the whole `getrf`/`gbtrf`/`sytrf`/`hetrf` family.
- LEARNINGS.md #1: a negative packed stride makes `zsptrf` corrupt the factor (`rcond = NaN`, `info = 0`).
- `dgetrf/lib/ndarray.js` validates `M` and `N` only.

## Reproduce

```bash
grep -n 'RangeError' lib/lapack/base/dgetrf/lib/ndarray.js
```
