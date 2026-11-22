---
id: 0059
title: dlasq2's multi-block restore after its iteration limit differs from the reference
status: open
area: base
opened: 2026-11-22
---

## Problem

On the INFO = 2 exit (dqds iteration limit), DLASQ2 restores SIGMA and repacks the qd array, and repeats this for earlier blocks (label 145, `IF( I1.GT.1 ) … GO TO 145`). In the reference, the loop body uses I0..N0 and neither changes before `GO TO 145`, so a second pass re-processes the same block with the new SIGMA. If some `Z(4*I1-5) < 0` stops the I1 scan above 1, it loops forever. The JS sets `i0 = i1` before looping, so it processes a different block, still ending at `n0` rather than `n1`. The JS therefore deviates from the reference, and the reference itself looks wrong. Which behaviour to follow is a faithfulness-policy decision (docs/optimization-policy.md).

## Evidence

- `data/lapack-3.12.0/SRC/dlasq2.f` label 145 to `GO TO 145` (around lines 509–530): I0 and N0 are not updated; I1 and N1 are.
- `lib/lapack/base/dlasq2/lib/base.js`, label-145 loop: `i0 = i1;` before continuing.
- The single-block case (I1 = 1) is identical in both, and is now tested with `importWithConstants` (ticket 0051). The multi-block case needs a split matrix that reaches the limit, which the same hook makes possible.
- Found while writing the INFO = 2 test (2026-11-22).

## Reproduce

```bash
grep -n "i0 = i1" lib/lapack/base/dlasq2/lib/base.js
sed -n 509,530p data/lapack-3.12.0/SRC/dlasq2.f
```
