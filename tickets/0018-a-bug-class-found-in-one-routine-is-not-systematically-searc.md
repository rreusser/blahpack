---
id: 0018
title: A bug class found in one routine is not systematically searched for in the rest
status: open
area: process
opened: 2026-11-18
---

## Problem

Most LEARNINGS entries name the siblings likely to share a bug, but nothing tracks whether they were checked. When a class is fixed in the routine where it was found, identical code elsewhere stays live. The structural fix — a lint rule, conformance check or harness property that makes the class fail everywhere — has been built for some classes (`base-arity`, `workspace-addressing-honored`, `no-nary-stdlib-minmax`) but not others.

## Evidence

- LEARNINGS.md #30 and LEARNINGS.md #32 fixed the `kld = max( 1, sa2 - sa1 )` band-stride clamp in `zpbtf2`/`dpbtf2`. The identical clamp is still in `dpbstf/lib/base.js:58` and `zpbstf/lib/base.js:64`, and neither routine is validated.
- LEARNINGS.md #36 fixed the `'conjugate-transpose'` mishandling in `dtrmm` only; 7 real routines still have it (ticket 0014).
- 28 of the 152 routines named as suspects in LEARNINGS follow-ups are still unvalidated, including `zlatps`, `dpbtrf`, `zpbtrf`, `dormlq`, `zunmlq`, `dgelss`, `zhptrd` and `zhpgst`.

## Reproduce

```bash
grep -nE 'max\( *1, *(sa2 - sa1|strideAB2 - strideAB1)' lib/*/base/*/lib/base.js
```
