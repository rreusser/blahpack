---
id: 0073
title: Wrappers reject calls that ndarray.js and the reference accept, on 28 modules
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

On 28 modules the wrapper throws on a call that `ndarray.js` accepted and the reference allows, so the public API rejects valid input. Calls whose recorded leading dimension is below the spec's row count are not counted (the wrapper cannot express them).

## Evidence

- Modules: dsbgst dseigt zlabrd ztpmqrt ztprfb ddisna dlangb dlansb dstqrb zlanhb zlatrz zungtr dla_gbrpvgrw dlabrd dlantb dlarrr dsapps dtpmqrt dtprfb zlangb zlansy zlaswp zhbgst zla_gbrpvgrw zlansb zlantb zlarfb_gett zlarzb.
- Banded norms (`dlangb`, `dlansb`, `dlantb`, `zlanhb`, …) require `LDAB >= max(1,N)`; the reference requires `LDAB >= KL+KU+1` (or `K+1`).
- `dtprfb`/`ztprfb` require `LDT >= max(1,M)`; T is K-by-K (ticket 0062).
- `dsbgst`/`zhbgst` reject `vect = 'none'`, which their `ndarray.js` accepts.
- `dseigt` and `dstqrb` throw on `WORK = null` instead of allocating (CONVENTIONS D5c).

## Reproduce

```bash
node bin/wrapper-replay.mjs dlangb dtprfb dsbgst dseigt
```
