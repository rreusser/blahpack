---
id: 0101
title: Crossover NX stand-ins differ from ILAENV(3), so blocked routines switch paths at other sizes than the reference
status: resolved
area: faithfulness
opened: 2026-11-26
resolved: 2026-11-26
---

## Problem

The reference's blocked routines read their crossover point NX from ILAENV(3): below NX columns they use unblocked code. For xGEQRF, xGEQLF, xGERQF, xGELQF and xGEQP3 that value is 128. The JS stand-ins hard-code NX = 0 in most of these (`const nx = 0`), so a JS run between 33 and 128 columns takes the blocked path where the reference takes the unblocked one. The results agree only up to rounding, so a fixture recorded from the reference at those sizes is not bit-comparable, and the JS doesn't follow the reference's path at those sizes.

How it is permitted: ILAENV is replaced by constants chosen per module, with no single table of the reference's ILAENV values that modules read or that a check compares against. Ticket 0100's evidence notes other cases: dlaqr3's `nmin = 12` against ILAENV(12) = 75, and zlaqr0/4's NWR.

## Evidence

- zgeqp3 used NX = 0 while dgeqp3 used 128. The 0100 fix made zgeqp3 use 128.
- `grep -ln "const nx = 0\|const NX = 0" lib/lapack/base/*/lib/base.js` lists dgeqrf, dgeqrfp, dgelqf, dgeqlf, dgerqf, their z twins and zungrq, among others.

## Reproduce

```bash
grep -ln "const nx = 0\|const NX = 0\|nx = 0;" lib/lapack/base/*/lib/base.js
```

## Evidence 2026-11-26

- dlaqr3 switches to dlaqr4 at `nmin = 12` (`lib/lapack/base/dlaqr2/lib/base.js:~291` family); the reference uses ILAENV(12) = 75, which zlaqr3 uses.
- zlaqr0/zlaqr4 hard-code NWR = 5 and NSR = 14; IPARMQ gives NS by NH (10 below 150, up to 64+) and NWR = NS (3·NS/2 past 500). dlaqr0/4 do use IPARMQ.
- JS dgehrd's crossover is NX = max(NB, 32) where ILAENV(3) gives 128, so it blocks on windows of 33–127 that the reference reduces unblocked.
- zlaqr0 applies `max(2, NSR)` before dropping NSR's odd bit; the reference applies it after. Only tiny N differ.

## Resolution

Duplicate of ticket 0049, which already covered the ILAENV/IPARMQ stand-ins; its evidence is now there. The two weren't connected because 0101 was opened without reading the open tickets first; `tickets.js new` now lists the closest open tickets and requires --reviewed (CONVENTIONS P5).
