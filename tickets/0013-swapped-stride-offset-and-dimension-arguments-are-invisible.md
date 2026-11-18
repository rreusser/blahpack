---
id: 0013
title: Swapped stride, offset and dimension arguments are invisible to every static check
status: open
area: typecheck
opened: 2026-11-18
---

## Problem

Strides, offsets, dimensions and leading dimensions are all plain `number`. A call that swaps `strideWork` and `offsetWork` passes the type check and lint. Layout fuzzing catches it, but only for routines in the harness.

## Evidence

LEARNINGS.md #48: `ztgsen`/`ztgsyl` tests ran with scrambled workspace arguments. LEARNINGS.md #47: `ztgevc`'s offset and stride went unread, which is undetectable while every caller passes `1, 0`.

## Reproduce

```bash
grep -n 'scrambled\|ignored offsetWork' test/harness/LEARNINGS.md
```
