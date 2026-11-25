---
id: 0074
title: Wrapper and ndarray.js return different results on the same call, on 6 modules
status: resolved
area: wrappers
opened: 2026-11-23
resolved: 2026-11-25
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

## Corpus rerun 2026-11-24

`node bin/wrapper-replay.mjs --all` with per-call watchdogs (ticket 0070). Twenty modules that used to time out now report, and three harness crashes are fixed.

Mismatches outside `null-work`, by variant:

- exact, 5 modules: dgecon dlacon dpocon dsyconvf zlacon.
- zero-size, 22 modules: dgecon dla_gbrpvgrw dlacon dlangb dlansb dlantb dlasyf dpocon dtprfb iladlr ilazlr zla_gbrpvgrw zlacon zlamtsqr zlangb zlanhb zlansb zlantb zlarfb_gett zlasyf ztprfb ztrtrs. dlasyf: the wrapper returns 0 where ndarray.js returns undefined for N = 0.
- transposed, 3 modules: dsyconvf zlahef_rook zsyconvf.

## Update 2026-11-25

`zlahef_rook`'s transposed mismatch was a test, not a library bug. "upper path with row swaps" passed a 16-element `W` for `nb = 8`, which needs `N*nb = 32`, so the routine read past the end and returned NaN. The test asserted only `kb = N`. It is fixed in the strict-mode PR. That `ndarray.js` accepts an undersized caller `W` is ticket 0077.

## Update 2026-11-25 (ticket 0089 PR)

- **zlacon, dlacon:** the exact and zero-size mismatches came from Fortran `SAVE` state in module-level variables. Replay runs `ndarray.js` and then the wrapper on the same recorded call, so the wrapper started from the state the first call left. The state now lives in one exported object, `SAVE`, in `base.js`. `test/harness/replay.js` snapshots it before each recorded call and restores it before every call it makes from that record. Both modules replay clean.
- **dlacon:** `ndarray.js` also had an N = 0 quick return that the reference lacks (with KASE = 0, dlacon.f sets KASE = 1 for any N). It is removed, and the test that asserted KASE = 0 now asserts the reference behavior.
- **Still open:** dlacn2 has the same N = 0 deviation (KASE 0 against the reference's 1). dgecon, dpocon and dsyconvf, and the zero-size and transposed lists above, are unchanged.

## Resolution

Resolved on branch `slop/gracious-dijkstra-q3yg0i` (the ticket 0022 PR). Its new coverage tests recorded calls that reached every listed module, and `node bin/wrapper-replay.mjs` now passes on all of them, as it does on the 802 modules that PR changes. Each fix has a regression test that fails on the old code.

**Fixes:**
- **dgecon/dpocon:** `ndarray.js` returned before setting RCOND at N = 0. The reference sets RCOND = 1.
- **iladlr/ilazlr:** the reference reads A(M,1) out of bounds when N = 0. base.js now quick-returns on M = 0 or N = 0, so all three entry points agree.
- **ztrtrs/dtrtrs:** `ndarray.js` quick-returned on NRHS = 0. The reference returns only on N = 0, so it still checks the diagonal and reports INFO.
- **zlamtsqr:** the wrapper had a hand-written K <= N check that the reference lacks.
- **zlanhb/zlansy:** `ndarray.js` did not validate `norm`, but the wrapper did (V3).
- **dsyconvf/zsyconvf:** the reference's revert uses a phantom row (`-IPIV(I)` after convert sets IPIV(I) = I), so its result depends on storage. The tests that rely on it call base.js directly.
- **dlacn2:** KASE = 1 at N = 0, as in the reference (fixed earlier).

**What prevents a recurrence:** `ci:wrapper-replay` gates every changed module. The coverage floor now holds for every module this PR touched, so their wrappers' paths are exercised and recorded.

**Replay tool fixes, in the same PR:**
- The null-work same-storage check compared against fresh copies of the arguments rather than the ones the wrapper received. Outputs returned at a nonzero offset were therefore reported as mismatches.
- The allocation instrumentation matched only upper-case `*WORK` names.
