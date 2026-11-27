---
id: 0115
title: Some tests build an expected result or bind the return value and never compare it
status: open
area: tests
opened: 2026-11-27
---

## Problem

Some tests compute the value they should check, or bind the routine's return value, and then never compare it. Such a test runs the code and asserts less than it appears to. Lint's `no-unused-vars` (ticket 0081) exposed these, and the cleanup removed the dead bindings; nothing in those tests checks the dropped values.

## Evidence

Removed in commit 3d4909f60 (ticket 0081):
- dlaqr3: `Hexp = extractMatrix( tc.H, … )` from the Fortran fixture; the test never compares H with it.
- dlaqr4: `expected = sortedEigs( wrExpected, wiExpected )`, never compared.
- dgesvd: `A_orig = copyArray( … )` in five tests, never used for a reconstruction check.
- zgetrf: `Aorig`, never used.
- zungql: a relative-error `ref`, computed and unused.
- dlaqge (2), dlaqgb (2), zher (1): the routine's return value bound and never asserted.

## Reproduce

```bash
git show 3d4909f60 -- 'lib/**/test/*.js' | grep -E "^-\s+const +(Hexp|expected|A_orig|Aorig|ref|info|ret|result|out|res|r) *=" | head -20
```

## Direction

For each, add the comparison the test was building toward (H against the fixture, a reconstruction from the SVD, the return value against the reference's), and confirm it fails on a broken routine.
