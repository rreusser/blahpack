---
id: 0039
title: The gesvx and gbsvx drivers return early on `nrhs === 0` where the reference does not
status: open
area: base
opened: 2026-11-20
---

## Problem

The reference `xGESVX`/`xGBSVX` still factor, estimate `RCOND` and compute `RPVGRW` when `NRHS = 0`. The JS `base.js` returns as soon as `N === 0 || nrhs === 0`, so `AF`, `rcond` and `RPVGRW` are left unset for `nrhs = 0`. That is a divergence from the Fortran baseline (CONVENTIONS V10 says quick returns mirror the Fortran). Recorded only in prose in PR #27.

## Evidence

- `lib/lapack/base/dgesvx/lib/base.js:126`: `if ( N === 0 || nrhs === 0 ) {`
- The same guard in `dgbsvx`, `zgesvx`, `zgbsvx` (PR #27, "Follow-ups").

## Reproduce

```bash
grep -n 'nrhs === 0' lib/lapack/base/{d,z}g{e,b}svx/lib/base.js
```
