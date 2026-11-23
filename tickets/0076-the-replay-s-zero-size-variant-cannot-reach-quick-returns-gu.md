---
id: 0076
title: The replay's zero-size variant cannot reach quick returns guarded by related arguments
status: open
area: harness
opened: 2026-11-23
---

## Problem

The wrapper replay's `zero-size` variant sets one dimension to 0 and requires the wrapper and `ndarray.js` to agree. When a related argument constrains that dimension (zgehrd's `ihi` must be at least `ilo - 1` and at most `N`), setting `N = 0` alone makes both layers reject the call, so the quick return is never reached and a disagreement there goes unnoticed.

## Evidence

- `zgehrd`'s `ndarray.js` returned `undefined` for N = 0, while `base.js` and the wrapper return 0. `node bin/wrapper-replay.mjs zgehrd --check` passed on that code. A wave-1 agent found it through coverage (the `N === 0` branch was never taken) and fixed it in the branch for ticket 0068.

## Reproduce

```bash
git show bde82d477~1:lib/lapack/base/zgehrd/lib/ndarray.js | grep -n "return;"
```

## Direction

When setting a dimension to 0, also clamp the arguments that the validation statements relate to it (index ranges like `ilo`/`ihi`, counts like `K <= N`), using the code-derived checks the validation variant already extracts, until every check passes.
