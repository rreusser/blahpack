---
id: 0073
title: Wrappers reject calls that ndarray.js and the reference accept, on 10 modules
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

On 10 modules (28 when opened) the wrapper throws on a call that `ndarray.js` accepted and the reference allows, so the public API rejects valid input. Calls whose recorded leading dimension is below the spec's row count are not counted (the wrapper cannot express them).

## Evidence

- Modules: dsbgst zhbgst dseigt dstqrb dsapps dtpmqrt ztpmqrt dlarrr zlanhb zlansy. (The other 18 of the original 28 replay clean since PR #42. Its LD-bound fixes, ticket 0087, cleared the banded norms, `*tprfb`, `*la_gbrpvgrw`, `zlarfb_gett` and `zlarzb`.)
- `dsbgst`/`zhbgst` reject `vect = 'none'`, which their `ndarray.js` accepts.
- `dseigt` and `dstqrb` throw on `WORK = null` instead of allocating (CONVENTIONS D5c).

## Reproduce

```bash
node bin/wrapper-replay.mjs dsbgst dseigt dtpmqrt zlansy
```

## Corpus rerun 2026-11-24

`node bin/wrapper-replay.mjs --all` with per-call watchdogs (ticket 0070). Twenty modules that used to time out now report, and three harness crashes are fixed.

Rejected calls, 26 modules: dla_gbrpvgrw dlangb dlansb dlantb dlarrr dorgtsqr_row dsapps dsbgst dseigt dseupd dstqrb dtpmqrt dtprfb zhbgst zla_gbrpvgrw zlangb zlanhb zlansb zlansy zlantb zlarfb_gett zlarzb zlaswp zlatrz ztpmqrt ztprfb. dseupd is a spec misclassification, not a wrapper bug (ticket 0082).

## Rerun 2026-11-25 (after PR #42)

`node bin/wrapper-replay.mjs` on the 28 original modules. 18 are clean, and 10 still reject calls: dsbgst zhbgst dseigt dstqrb dsapps dtpmqrt ztpmqrt dlarrr zlanhb zlansy. zlanhb dropped from 19 rejected calls to 3. The rest of the 2026-11-24 list (`dorgtsqr_row`, `zlaswp`, `zlatrz`, the banded norms, `*tprfb`, `*la_gbrpvgrw`, `zlarfb_gett`, `zlarzb`) is clean. `dseupd` was not rerun.
