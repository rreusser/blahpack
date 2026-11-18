---
id: 0029
title: ztgsen pairs the B diagonal blocks differently from dtgsen in its DIF(2) estimate
status: open
area: base
opened: 2026-11-18
---

## Problem

In the transposed DIF(2) solve, reference `dtgsen` calls `DTGSYL( 'T', …, A( I, I ), A, WORK, B( I, I ), B, … )`: the B blocks are paired with the A blocks (B22 with A22, B11 with A11). Reference `ztgsen` calls `ZTGSYL( 'C', …, A( I, I ), A, WORK, B, B( I, I ), … )`, which pairs B11 with A22. Since DIF(2) is meant to be the same quantity in both, one of the two reference sources looks wrong, most likely `ztgsen`. Our JS copies each source faithfully, so `ztgsen` DIF(2) is wrong whenever B11 ≠ B22.

Whether to deviate from the reference is a policy decision (docs/optimization-policy.md); until then this should at least be documented and pinned by a test.

## Evidence

- `data/lapack-3.12.0/SRC/ztgsen.f` ~L740 vs `data/lapack-3.12.0/SRC/dtgsen.f` ~L788.
- Found during break-mutant triage (tickets/0027). The new `ztgsen` DIF(2) test uses equal B diagonal blocks precisely so that it does not depend on this.
- Not yet checked against upstream LAPACK's issue tracker or newer releases.

## Reproduce

```bash
sed -n 736,742p data/lapack-3.12.0/SRC/ztgsen.f
sed -n 784,790p data/lapack-3.12.0/SRC/dtgsen.f
```
