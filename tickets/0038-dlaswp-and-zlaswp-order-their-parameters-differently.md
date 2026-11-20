---
id: 0038
title: `dlaswp` and `zlaswp` order their parameters differently
status: open
area: wrappers
opened: 2026-11-20
---

## Problem

The real and complex row-interchange routines have the same Fortran signature, but the JS puts the row-increment argument in different places: `dlaswp` takes `inck` before `IPIV`, `zlaswp` takes `incx` last and names it differently. A caller who switches dtype gets silently shifted arguments. Recorded only in prose in PR #27. Related: ticket 0007 (sibling contracts are not compared).

## Evidence

- `lib/lapack/base/dlaswp/lib/dlaswp.js:46`: `dlaswp( order, N, A, LDA, k1, k2, inck, IPIV, strideIPIV )`
- `lib/lapack/base/zlaswp/lib/zlaswp.js:39`: `zlaswp( order, N, A, LDA, k1, k2, IPIV, strideIPIV, incx )`
- The `ndarray.js` forms differ the same way.

## Reproduce

```bash
grep -n '^function' lib/lapack/base/{d,z}laswp/lib/{d,z}laswp.js lib/lapack/base/{d,z}laswp/lib/ndarray.js 2>/dev/null
```
