---
id: 0049
title: Some QR-family routines hardcode tuning values that differ from the reference ILAENV/IPARMQ values
status: open
area: base
opened: 2026-11-18
---

## Problem

ILAENV is replaced by hardcoded constants. That is fine when they equal what reference IPARMQ returns, but where they differ the routine takes a different path than the reference: still a valid Schur form, but different deflation and shift schedules, eigenvalue order, T and Z. Because the results stay valid, property tests cannot see it; only unsorted comparison against reference fixtures can (tickets/0046 was one such case, now fixed).

## Evidence

- `dlaqr3` (shared `dlaqr23impl` in `lib/lapack/base/dlaqr2/lib/base.js`, ~L180) uses `nmin = 12`; Fortran DLAQR3 gets ILAENV(12) = 75 (`zlaqr3` correctly uses 75).
- `zlaqr0` and `zlaqr4` hardcode `NWR = 5` and `NSR = 14` instead of the IPARMQ values, which depend on `nh` (2/4/10/… for NS). They agree with each other but not with the reference.
- Found during break-mutant triage (tickets/0045).
- Likely root of the `dlaqr3` value: the translate skill's idiom table said `ILAENV(12) → NMIN=12 (dlaqr3 threshold)`, confusing the query number (ISPEC = INMIN = 12) with the value IPARMQ returns (NMIN = 75). Corrected when the branch merged `main`. Nothing checks the skill's idiom table against the reference sources, so a wrong row propagates into every translation that follows it.

## Reproduce

```bash
grep -n "nmin = 12" lib/lapack/base/dlaqr2/lib/base.js
grep -n "NWR\|NSR" lib/lapack/base/zlaqr0/lib/base.js lib/lapack/base/zlaqr4/lib/base.js | head
```
