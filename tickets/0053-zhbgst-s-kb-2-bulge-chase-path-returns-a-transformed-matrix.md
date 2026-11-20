---
id: 0053
title: zhbgst's kb >= 2 bulge-chase path returns a transformed matrix that differs from the reference by up to 1e-1
status: open
area: base
opened: 2026-11-20
---

## Problem

In `zhbgst`, the split-Cholesky reduction of a banded Hermitian-definite pencil, the bulge-chase path for kb >= 2 produces a transformed AB that differs from the reference by up to about 1e-1, for both upper and lower storage. X (the transformation, vect = 'update') also still differs for upper n10 and n12. The module's kb >= 2 tests were weakened to "info = 0 and finite". A comment admitted "known translation issues", but no ticket existed (ticket 0055 covers how that was allowed).

## Evidence

- Errors against the Fortran fixtures (`lib/lapack/base/zhbgst/test/fixtures`), after the 2026-11-20 fix of one bad line: upper/lower n7 4.4e-2 / 2.7e-2 (columns 4–6); n10 5.9e-2 / 3.2e-2; n12, ka = kb = 3, 9.5e-2 / 3.4e-2. n8 with ka = 3, kb = 2 is exact.
- Found during break-mutant triage (ticket 0045, wave 2b). The same pass removed a leftover draft line ("wrong: ...") that corrupted AB(1,I-K+KA) before it was read, and a dead scaffolding loop. More draft remnants remain near lines 346 and 589–601 (ticket 0054).

## Reproduce

```bash
grep -n "known translation issues" lib/lapack/base/zhbgst/test/test.ndarray.js
grep -nE "Let me|Actually" lib/lapack/base/zhbgst/lib/base.js
```
