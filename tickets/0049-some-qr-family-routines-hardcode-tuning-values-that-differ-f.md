---
id: 0049
title: Some QR-family routines hardcode tuning values that differ from the reference ILAENV/IPARMQ values
status: resolved
area: base
opened: 2026-11-18
resolved: 2026-11-26
---

## Problem

The crossover points (ILAENV(3), NX) are part of this too: see the 2026-11-26 evidence.

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

## Evidence 2026-11-26 (merged from ticket 0101, a duplicate)

The reference's blocked routines read their crossover point NX from ILAENV(3): below NX columns they use unblocked code. For xGEQRF, xGEQLF, xGERQF, xGELQF and xGEQP3 that value is 128. The JS stand-ins hard-code NX = 0 in most of these (`const nx = 0`), so a JS run between 33 and 128 columns takes the blocked path where the reference takes the unblocked one. The results agree only up to rounding, so a fixture recorded from the reference at those sizes is not bit-comparable, and the JS doesn't follow the reference's path at those sizes.

How it is permitted: ILAENV is replaced by constants chosen per module, with no single table of the reference's ILAENV values that modules read or that a check compares against. Ticket 0100's evidence notes other cases: dlaqr3's `nmin = 12` against ILAENV(12) = 75, and zlaqr0/4's NWR.

- zgeqp3 used NX = 0 while dgeqp3 used 128. The 0100 fix made zgeqp3 use 128.
- `grep -ln "const nx = 0\|const NX = 0" lib/lapack/base/*/lib/base.js` lists dgeqrf, dgeqrfp, dgelqf, dgeqlf, dgerqf, their z twins and zungrq, among others.

### Evidence 2026-11-26 (later)

- dlaqr3 switches to dlaqr4 at `nmin = 12` (`lib/lapack/base/dlaqr2/lib/base.js:~291` family); the reference uses ILAENV(12) = 75, which zlaqr3 uses.
- zlaqr0/zlaqr4 hard-code NWR = 5 and NSR = 14; IPARMQ gives NS by NH (10 below 150, up to 64+) and NWR = NS (3·NS/2 past 500). dlaqr0/4 do use IPARMQ.
- JS dgehrd's crossover is NX = max(NB, 32) where ILAENV(3) gives 128, so it blocks on windows of 33–127 that the reference reduces unblocked.
- zlaqr0 applies `max(2, NSR)` before dropping NSR's odd bit; the reference applies it after. Only tiny N differ.

Also reproduce with:

```bash
grep -ln "const nx = 0\|const NX = 0\|nx = 0;" lib/lapack/base/*/lib/base.js
```

## Resolution

ILAENV, IPARMQ and IEEECK are translated modules, and every base.js whose reference queries them takes its tuning values from ilaenv with the reference's arguments (CONVENTIONS X3, lint:tuning-from-ilaenv over the generated spec fact tuning): 140 modules migrated, the wrong crossovers, block sizes and QR-sweep values among them now the reference's, each changed path with a regression test that fails on the old code.
