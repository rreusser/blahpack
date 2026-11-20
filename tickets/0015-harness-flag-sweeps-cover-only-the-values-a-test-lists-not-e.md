---
id: 0015
title: Harness flag sweeps cover only the values a test lists, not every value a routine accepts
status: open
area: harness
opened: 2026-11-18
---

## Problem

A routine reaches L3 or L4 when the flag combinations its test author enumerated pass. Nothing ties that enumeration to the values the routine's validator accepts, so an accepted-but-mishandled value is never exercised.

## Evidence

`dgels` is L4 and `dgemqrt` is L3. Both accept `'conjugate-transpose'` and mishandle it (ticket 0014).

## Reproduce

```bash
node bin/validation-level.js 2>&1 | grep -wE 'dgels|dgemqrt'
```
