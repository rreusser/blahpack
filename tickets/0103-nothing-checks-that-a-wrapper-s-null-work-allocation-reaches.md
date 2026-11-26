---
id: 0103
title: Nothing checks that a wrapper's null-WORK allocation reaches the optimum, so callers silently get a slower path
status: open
area: wrappers
opened: 2026-11-26
---

## Problem

CONVENTIONS D5c requires `<routine>.js` to allocate a sufficient workspace when WORK is `null`, and W6 says that allocation is the reference's optimum. Only the minimum is checked. Since ticket 0100 the blocked routines adapt to their workspace: given the minimum they run unblocked, and given less than the optimum they shrink NB. A wrapper, or a driver's base.js sizing a callee's slice, that allocates less than the optimum still gets a correct result, but on a slower path, and nothing reports it.

How it is permitted:
- `workspace-guard` checks the allocation against the `ndarray.js` minimum only;
- the `null-work` replay variant accepts rounding differences, and a path change produces only that;
- no per-routine optimum is recorded: the reference computes LWKOPT by a workspace query (LWORK = -1), which the JS has no counterpart for (W1).

A check could record the reference's LWKOPT from the Fortran workspace query for each fixture's arguments, and require each wrapper's `null` allocation to reach it.

## Evidence

- Ticket 0100 moved the dormqr family's T into the reference's TSIZE part, so its optimum became `nw*32 + 4160`. Callers that still allocated `nw*32 + 1056` lost the blocked path. The only visible sign was zggevx's test "N=33 (> NB=32) with WORK = null matches an ample explicit WORK" (`lib/lapack/base/zggevx/test/test.zggevx.js:125`), which failed by about 1e-12.
- The same happened through dgehrd (optimum `32N + 4160`) to dgeevx's and zgeevx's bit-exact `WORK = null` tests, and the dlaqr2/3 family's.

## Reproduce

```bash
grep -rln "1056\|2080" lib/lapack/base/*/lib/*.js | head
```
