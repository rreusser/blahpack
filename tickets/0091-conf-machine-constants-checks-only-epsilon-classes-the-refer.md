---
id: 0091
title: conf:machine-constants checks only epsilon classes the reference never queries, not ones it queries that the port omits
status: open
area: general
opened: 2026-11-25
---

## Problem

`conf:machine-constants` (ticket 0089) fails a module whose epsilon is a class its reference never queries. It does not fail the reverse: a module whose reference queries `DLAMCH('P')` but whose port uses no epsilon at all, or computes it some other way. Checked naively, that would misfire on modules that legitimately take their constants from a shared implementation (dlaqr3 uses dlaqr2's `dlaqr23impl`) and on references that compute a constant they never use (ztgsna's EPS). A port that hard-codes a derived value (zlargv's SAFMN2 before ticket 0089) also escapes both directions.

## Evidence

- The prototype for ticket 0089 found 3 modules that the reference says query an epsilon the JS never uses: dlaqr3 (shared implementation, legitimate), zlargv (a hard-coded SAFMN2, which was wrong) and ztgsna (computed but unused in the reference, legitimate).
- A useful check would follow the module's imports into the shared implementation before deciding, and flag literals that equal a power of two derived from the epsilon.

## Reproduce

```bash
node bin/conformance.js lib/lapack/base/dlaqr3   # passes, though dlaqr3.f queries DLAMCH('P')
```
