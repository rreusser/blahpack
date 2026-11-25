---
id: 0072
title: Wrappers given WORK = null return different results, a different info, or throw, on 35 modules
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

CONVENTIONS D5c: a wrapper given `WORK = null` must allocate a sufficient workspace, and its results must then match a caller-supplied workspace. On 35 modules, replaying a recorded valid `ndarray.js` call through the wrapper with every workspace `null` gives:

- NaN (an undersized allocation that drops writes);
- a different `info`;
- a large difference (not rounding);
- or a throw. Some wrappers throw on `null` instead of allocating, e.g. `dseigt` and `dstqrb` ("WORK array must have at least N elements. Provided length: 0"; those are counted under ticket 0073).

Ticket 0060's guard missed these: its tests never reached the null branch with these inputs (ticket 0063).

## Evidence

From `node bin/wrapper-replay.mjs --all` on branch `slop/gracious-dijkstra-q3yg0i` (a485229db):

- Modules: dggsvd3 dpocon dtrsen zgsvj0 zunbdb4 zunglq zungrq zunmbr dgecon dgelss dggsvp3 dorbdb3 dsytri2x dtgsen zgsvj1 zungtr zunm22 zunmtr dbdsqr dorbdb4 dorglq dorgrq dormbr dormql dormrq zgeev zggsvd3 zungqr dlaqr2 dlatrs3 dorgtr dorm22 dormtr dtgsna zunbdb3.
- Examples: `zunglq` A[64] NaN; `zunmbr` C[6] NaN; `dorbdb3` X11[1] NaN; `dgelss` A[0] -11.1 (expected -0.29); `dorm22` returns info -12 (expected 0); `zgsvj0` returns 0 (expected -26).
- Rounding-level differences (workspace-dependent blocking) are not counted.

## Reproduce

```bash
node bin/wrapper-replay.mjs zunglq zunmbr dorm22
```

## Corpus rerun 2026-11-24

`node bin/wrapper-replay.mjs --all` with per-call watchdogs (ticket 0070). Twenty modules that used to time out now report, and three harness crashes are fixed.

`null-work` mismatches, 15 modules: dgecon dlasd5 dlatrs3 dlatrz dorbdb4 dorm22 dormbr dpocon dsytri2x dtgsna zgsvj0 zgsvj1 zlarz zungrq zunmbr. New since the timeouts were removed: dsytri2x (NaN in A, so the wrapper's allocation is undersized).

## Update 2026-11-25

dtgsna is fixed: the wrapper now allocates the reference LWMIN for `job = eigenvectors/both`, and a wrapper test with `WORK = null` matches the fixture.
