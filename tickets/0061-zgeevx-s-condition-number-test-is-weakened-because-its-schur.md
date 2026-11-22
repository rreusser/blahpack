---
id: 0061
title: zgeevx's condition-number test is weakened because its Schur form is said to differ from the reference
status: open
area: base
opened: 2026-11-22
---

## Problem

`zgeevx`'s `sense = 'both'` test compares only eigenvalues and checks that RCONDE/RCONDV are finite and positive. Its comment explains that "the Schur form from zhseqr can differ from Fortran's by an off-diagonal rotation, so condition numbers are not bitwise comparable". Under CONVENTIONS T1, the JS must reproduce the reference fixtures, and only non-unique outputs may be compared through invariants. A Schur form with a given eigenvalue order is unique up to diagonal phases, not an arbitrary rotation. So the comment more likely describes a deviation in `zhseqr` (or its callees) from the reference, and the test was weakened around it.

## Evidence

- `lib/lapack/base/zgeevx/test/test.ndarray.js`, test "N=3 sense=both with balance=both — basic validity" (around line 321).
- Found by the code-comment check for ticket 0055 (2026-11-22). Not yet investigated: compare the JS Schur form and the condition numbers with the Fortran fixture for this input.

## Reproduce

```bash
grep -n "can differ" lib/lapack/base/zgeevx/test/test.ndarray.js
```
