---
id: 0020
title: Which layouts a routine must be bit-exact under is chosen by hand for each test
status: open
area: harness
opened: 2026-11-18
---

## Problem

Bit-exact layout invariance is the harness's strongest check, but it does not hold across stride-specialized fast paths: optimized `dgemv`/`dgemm` form switches, `incx == 1` BLAS paths, and pivot ties. Each test author picks the layout family by hand. A wrong pick causes either a false alarm that costs an investigation, or a family that is too narrow and hides addressing bugs. The required family follows from the routine's dependency graph and could be derived.

## Evidence

9 of 52 LEARNINGS entries are investigations of over-assertion or fast-path reordering, not routine bugs: #1, #3, #24, #25, #29, #31, #33, #37 and #40. Each ends by prescribing the family ("pure-addressing", "positive strides only") for a list of siblings.

## Reproduce

```bash
grep -cE 'harness-over-assertion|fast-path-reorder|`tolerance`' test/harness/LEARNINGS.md
```
