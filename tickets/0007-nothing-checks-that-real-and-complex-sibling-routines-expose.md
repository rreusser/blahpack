---
id: 0007
title: Nothing checks that real and complex sibling routines expose the same contract
status: open
area: conformance
opened: 2026-11-18
---

## Problem

`d` and `z` twins are translated and fixed separately. Their interfaces and guards drift apart: an output is returned in different ways, or a fix lands in one twin only. LEARNINGS.md #6 proposed diffing d/z twins as a high-signal probe. No check does it.

## Evidence

- `dtgsen` writes the cluster size to `M[0]`. `ztgsen` overwrites its `M` parameter as a local and returns `{ m }`, so `zgges` passes an `Int32Array` that is silently discarded.
- LEARNINGS.md #49: `zgehrd` `base.js` asserts the WORK size and `dgehrd` does not, so `dgehrd` dropped its out-of-range writes silently.
- LEARNINGS.md #11, LEARNINGS.md #12, LEARNINGS.md #13, LEARNINGS.md #15: real WORK guards lagged complex siblings that were already correct.

## Reproduce

```bash
grep -n '\bM = 0\|.m.: M' lib/lapack/base/ztgsen/lib/base.js; grep -n 'M\[' lib/lapack/base/dtgsen/lib/base.js | head -3
```
