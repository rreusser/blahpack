---
id: 0028
title: dlaqr4 hardcodes its ILAENV tuning values instead of the IPARMQ values the reference uses
status: resolved
area: base
opened: 2026-11-18
resolved: 2026-11-18
---

## Problem

The JS `dlaqr4` hardcodes its ILAENV tuning values (`nwr = 4`, `nsr = 2`, `nmin = NTINY = 15`, `kacc22 = 0`). The reference `DLAQR4` calls ILAENV (that is, IPARMQ) exactly as `DLAQR0` does, and the JS `dlaqr0` has an IPARMQ port. So `dlaqr4` takes a different deflation and shift schedule than the reference. Eigenvalues still agree as a set, but their order on the Schur diagonal (and therefore T and Z) does not match the reference.

## Evidence

- `lib/lapack/base/dlaqr4/lib/base.js` ~L103–107: the hardcoded values, commented as ILAENV(13)/(15).
- Found during break-mutant triage (tickets/0027). On the existing Fortran fixtures `40x40_wantt_wantz.json` and `80x80_wantt_wantz.json`, the JS diagonal order differs from the reference (max unsorted difference 13.5 and 30.0). Sorted eigenvalues agree, and JS `dlaqr0` matches the same fixtures unsorted to about 4e-13.
- The `dlaqr4` tests never import those two fixtures, which is why nothing failed.

## Reproduce

```bash
grep -n "nwr = 4\|nsr = 2" lib/lapack/base/dlaqr4/lib/base.js
grep -c "40x40_wantt_wantz\|80x80_wantt_wantz" lib/lapack/base/dlaqr4/test/*.js
```

## Resolution

Fixed during break-mutant triage (tickets/0027): dlaqr4 now uses the IPARMQ parameters, shared with dlaqr0 (whose nh >= 150 shift-count formula was also corrected to NH / NINT(log2 NH)). The 40x40 and 80x80 reference fixtures now match unsorted to ~4e-13, down from 13.5 and 30. Both are now loaded by dlaqr4's tests, which fail on the old code; a bit-exact dlaqr0 vs dlaqr4 test pins the shared schedule.
