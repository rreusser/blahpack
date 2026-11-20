---
id: 0057
title: Equivalence proofs that depend on another module's code do not go stale when that code changes
status: open
area: harness
opened: 2026-11-20
---

## Problem

`test/break-mutants.equivalent.json` keys each proof by a fingerprint of the loop and the statement after it, so a proof goes stale when that code changes (ticket 0045). Some proofs also rely on what a callee does. Changing the callee leaves the proof's key unchanged, so the proof keeps counting as valid even if it has become false. The gate cannot see this.

## Evidence

- `lib/lapack/base/dlasq3/lib/base.js` skip-after-this-break@3 (2026-11-20): the proof that the break cannot execute relies on how `dlasq5` sets DMIN (its early returns, and `Math.min` propagating NaN). The entry says so ("DEPENDS ON dlasq5's code ... ticket 0057"), but nothing checks it.
- One possible fix: an entry declares the files or functions it depends on, and their fingerprints become part of what makes it current.

## Reproduce

```bash
grep -n "DEPENDS ON" test/break-mutants.equivalent.json
```
