---
id: 0014
title: Accepted option values are not checked against the values the reference Fortran accepts
status: open
area: conformance
opened: 2026-11-18
---

## Problem

`option-parity` only checks that the wrapper and `ndarray.js` agree with *each other*. Nothing checks either one against the reference. Real routines validate `trans` with stdlib's `isTransposeOperation`, which accepts `'conjugate-transpose'`. The reference rejects `'C'` (`INFO = -k`), and `base.js` branches on `=== 'transpose'`, so the third value silently takes no branch or the wrong one. The `no-dprefix-conjugate-transpose` lint rule bans the *literal* in real routines but not its acceptance through the helper.

## Evidence

- `dgemqrt` with `side='left'`, `trans='conjugate-transpose'` matches neither `left && tran` nor `left && trans === 'no-transpose'`, so C is returned unchanged with no error. Fortran `DGEMQRT` sets `INFO = -4`.
- The same pattern (helper accepts three values, base tests `=== 'transpose'`) is in `dgels`, `dgemlqt`, `dlamswlq`, `dlamtsqr`, `dtpmlqt` and `dtpmqrt`. Fortran `DGELS` accepts only `'N'`/`'T'`.
- LEARNINGS.md #36: `dtrmm` had this bug. It was fixed in that routine only.

## Reproduce

```bash
for d in lib/*/base/d*/lib; do grep -q "=== 'transpose'" $d/base.js 2>/dev/null && grep -qE 'isTransposeOperation|isMatrixTranspose' $d/ndarray.js 2>/dev/null && echo $d; done
```
