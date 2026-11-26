---
id: 0016
title: Workspace sizes are hand-copied into each layer with nothing tying them to what the kernel consumes
status: open
area: workspace
opened: 2026-11-18
---

## Problem

The JS kernels hardcode NB and, unlike the reference, do not shrink it to fit the workspace they are given. Several also store `T` in a separate trailing block. The required WORK size is therefore not the reference `LWORK` formula. It is restated by hand in the `base.js` docs, the `ndarray.js` guard and the wrapper's `null` auto-allocation.

The `work-assert` conformance check confirms only that *a* guard exists. The harness's `assertWorkspaceSufficient` checks that the advertised minimum suffices, but only for the roughly 80 routines whose tests call it. `base.js` does not assert at all, and typed arrays drop out-of-range writes and return `undefined` for out-of-range reads. Under-allocation therefore shows up as NaN or silently wrong output.

## Evidence

- 17 of 52 LEARNINGS entries are this class: #2, #4, #7–#16, #18, #19, #38, #41 and #49, the largest single class in the file.
- LEARNINGS.md #49 (2026-11-18): `dgehrd`/`zgehrd` wrappers auto-allocated the unblocked size. The `null` path at blocked sizes is not tested anywhere.
- About 80 routines call `assertWorkspaceSufficient`; there are 825 LAPACK modules.
- CONVENTIONS rules that cite this ticket: W3 (`conf:work-assert` checks only the `WORK` guard; nothing checks the `IWORK`/`RWORK` guards) and W5 (nothing checks the required size stated in the `@param` JSDoc text).

- Ticket 0072's fixes (2026-11-23) size seven orthogonal-generator wrappers' `WORK = null` allocation as `LDWORK*32` when blocked. That 32 must equal the `NB` constant in each delegate's `base.js` (dorglq, dorgrq, dorgtr, zunglq, zungqr, zungtr, as zungbr already did). Nothing ties the literal to the constant; exporting a workspace-size function from `base.js` would.

- The JS dgehrd, dormqr, zgehrd and zunmqr choose their blocked code from NB = 32 alone and ignore LWORK. So the reference minimum LWORK of their callers is not enough in JS. Example: dlaqr2/dlaqr3/zlaqr3 at 2*NW. An ndarray call with exactly that WORK and NS > 33 returns NaN (dlaqr2, N = 50, nw = 40, WORK of 80). The wrappers now allocate 33*nw + 2080 to cover the blocked path (ticket 0072), but `ndarray.js` still accepts 2*nw, and the JSDoc still states it. zlaqr4 sizes its tuning from `WORK.length`, so its results depend on the caller's buffer size rather than on an explicit LWORK. Reported by a wave-3 agent.

## Reproduce

```bash
grep -rl assertWorkspaceSufficient lib/*/base/*/test/ | sed -E 's#lib/[a-z]+/base/([^/]+)/.*#\1#' | sort -u | wc -l
```

## Evidence 2026-11-26

- zgges's `ndarray.js` demanded WORK of `N + max(8N, 1)` and RWORK of `2N + max(8N, 1)`, while `spec/zgges.json` already held the reference's `max(1, 2N)` and `8N`: the spec knew the right minimum and nothing compared the hand-written check with it. Fixed in the ticket-0049 PR; found by an agent reading the code. Similar: ztgsna (ticket 0104, resolved).

## Evidence 2026-11-26 (workspace-minimum check)

- `bin/gen-lwmin.mjs` recorded the reference's workspace minimum into `data/fortran-lwmin.json`: 161 modules, 28,539 rows over the lwkopt grid. For each workspace with a length argument it records the smallest length that neither the routine nor any of its callees rejects. It also records the declared extents (e.g. `RWORK( 8*N )`). `bin/workspace-minimum.mjs --all --check` replays the rows through each `ndarray.js` with `base.js` stopped.
- First run: 41 modules fail, 4,403 row-workspaces in all.
  - 20 modules demand too much (ndarray.js rejects a call at the reference's minimum). Examples: dtgsyl 39200 vs 1, d/z orgtsqr_row and ungtsqr_row 19600 vs 1, dlamtsqr 5600 vs 40, zungtsqr 15400 vs 9800, d/z orbdb1 and unbdb1 140 vs 70, dsyevx 8 vs 1, ztgsen WORK/IWORK, and dggsvd3/zggsvd3 280 vs the effective 141. Some of these are at zero dimensions: dtgex2 32 vs 0, d/z orbdb5/6 and unbdb5/6 1 vs 0. Declared extents: zggevx IWORK N+6 vs the declared N+2, and dgeevx IWORK.
  - 22 modules demand too little (ndarray.js reaches base.js at minimum − 1). Most have no check at all on that workspace: d/z gsvj0/1 (0 vs M), dlatrs3, zhetrd_he2hb (0 vs 78400), the IWORK of dstevr and dsyevr (0 vs 10N), ztgsen IWORK and ztgsyl. Others are off by a small amount: d/z orbdb2, zunbdb4, d/z sytrf_aa, dtgexc, zheev, zheevx, d/z ormhr/unmhr, d/z orghr/unghr at N = 1, and ztgsen WORK.
- Reported but not failed:
  - 5,645 row-workspaces at a zero dimension accept less than the reference's minimum (W3: an empty problem needs no workspace).
  - 4,120 row-workspaces accept less than a declared extent the reference cannot check.
  - Some rows were not run: dlamswlq/dlamtsqr K > N (kept deliberately, ticket 0103), and rows of d/z tgsen and d/z lamtsqr whose reference callees reject the call at every length.
- Before this check, nothing compared the IWORK/RWORK guards with the reference.
