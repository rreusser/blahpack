---
id: 0100
title: Blocked base routines ignore the workspace they get, so callers sized by the reference overrun
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

The reference's blocked routines (DGEHRD, DORGQR, DORMQR, DGEQRF, …) pick their block size from LWORK. With less than the blocked size, they shrink NB, or fall back to unblocked code. That's why their callers can document small minimums: DGEEV needs only 4N, ZGEEV 2N and DLAQR3 2*NW.

About 70 JS `base.js` files instead hard-code their block size (`const NB = 32` / `DEFAULT_NB`) and partition WORK on that assumption, whatever its length. A caller that sizes WORK by the reference's documented minimum then overruns once the problem passes the blocking threshold (typically 33 or more). A typed array drops writes past its end and reads `undefined`, so the result is NaN. An iterative routine then spins to its iteration limit, so the failure can look like a timeout.

Ticket 0096 fixed this one caller at a time, by raising each declared minimum to what the always-blocked JS callee uses. For example, zgeev's minimum is now 33N+2047 for N ≥ 34. That is larger than the reference's, and it would fall back to the reference's if the callees adapted their blocking.

How it is permitted:
- the `min-work` replay variant (ticket 0096) checks a declared minimum only at the sizes the module's tests reach, and most tests stay below the blocking threshold, so dgeev passed it with tests at N < 34;
- `harness:assertWorkspaceSufficient` runs only where a test calls it.

## Evidence

- zgeev at N = 80 with its old minimum 2N: info = 80 and NaN eigenvalues after 16.8 s. With a large WORK: info = 0 in 0.3 s. dgeev at N = 80 with 4N behaves the same way (74.7 s, NaN).
- The laqr2/3 family's minimums were raised to `33*JW + 2080` for JW > 32 for the same reason.
- `grep -ln "const NB = \|DEFAULT_NB = " lib/lapack/base/*/lib/base.js` lists about 70 modules.

## Reproduce

```bash
grep -ln "const NB = \|DEFAULT_NB = \|const nb = [0-9]" lib/lapack/base/*/lib/base.js | wc -l
```
