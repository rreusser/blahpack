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

## Reproduce

```bash
grep -rl assertWorkspaceSufficient lib/*/base/*/test/ | sed -E 's#lib/[a-z]+/base/([^/]+)/.*#\1#' | sort -u | wc -l
```
