---
id: 0104
title: ztgsna demands 2N^2 + 4(N-1) WORK for JOB = V/B where the reference demands 2N^2
status: resolved
area: base
opened: 2026-11-26
resolved: 2026-11-26
---

## Problem

`lib/lapack/base/ztgsna/lib/ndarray.js:83` demands `2*N*N + max(1, 4*(N-1))` for JOB = 'V' or 'B'. The reference's LWMIN is `2*N*N` (`ztgsna.f:401`), and it passes ZTGSYL a length-1 `DUMMY` workspace (`ztgsna.f:500`), which the IJOB it uses never touches. So ztgsna rejects valid calls, against V1, and its callers' minimums would inherit the extra.

How it is permitted: the `min-work` replay only lowers a workspace to what `ndarray.js` demands, never below it to the reference's minimum, so a minimum above the reference's is never tested. Nothing compares the hand-written minimums with the spec's reference-derived `minLength` (ticket 0016).

## Evidence

- Found while lowering zggevx's minimums (ticket 0100). zggevx calls ztgsna's base.js directly with the reference's 2N(N+1), so it is unaffected.
- Check whether the JS ztgsna base.js hands ztgsyl a slice of WORK, unlike the reference's DUMMY.

## Reproduce

```bash
grep -n "4 \* ( N - 1 )" lib/lapack/base/ztgsna/lib/ndarray.js
```

## Resolution

ztgsna's ndarray.js and wrapper now demand and allocate the reference's 2*N*N for JOB = V/B; ztgsyl, called with IJOB = 3, never touches the WORK it is handed (the reference passes a length-1 DUMMY). Regression test: WORK of exactly 2*N*N at offset 2 matches an ample WORK, and one less throws.
