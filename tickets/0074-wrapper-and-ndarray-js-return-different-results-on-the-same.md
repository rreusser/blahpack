---
id: 0074
title: Wrapper and ndarray.js return different results on the same call, on 6 modules
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

With the recorded workspaces passed through (so only the `order`/LD mapping and the wrapper's own logic differ), the wrapper's results differ from `ndarray.js` on 6 modules. Each layer must compute the same thing: a wrapper that calls `base.js` directly skips any quick return or normalisation that `ndarray.js` adds, and vice versa.

## Evidence

- Modules: dlacon dpocon dgecon dlacn2 dsyconvf zlacon.
- At N = 0: `dpocon` returns rcond 1 through the wrapper and 0.5 through `ndarray.js`; `dgecon` gives 1 against 0; `dlacon`/`dlacn2` give kase 1 against 0. The reference DLACN2 sets KASE = 1 for N = 0, so here `ndarray.js` deviates.
- `dsyconvf` (lower, revert, offset A): the wrapper returns A[1] = 777 (an untouched sentinel), against 3.
- `zlacon`: x[2] 0 against 1.

## Reproduce

```bash
node bin/wrapper-replay.mjs dpocon dgecon dlacn2 dsyconvf
```
