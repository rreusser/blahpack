---
id: 0106
title: The reference minimum workspace-minimum checks against is sampled: unseen reads and structured-input paths can exceed it
status: open
area: workspace
opened: 2026-11-26
---

## Problem

CONVENTIONS W3 says `ndarray.js` demands the reference's minimum workspace, and `ci:workspace-minimum` checks it against `data/fortran-lwmin.json`. That cache measures the reference: for each grid row, the smallest length that neither the routine nor a callee rejects and past which nothing is written, on three data samples (zero, seeded random, rank-deficient random). A sampled minimum is only a lower bound on the true one, the maximum over all inputs:

- Reads past the length leave no trace, so a path that reads past the minimum without writing there is not seen.
- A path that only structured input reaches (SPD, Hessenberg or Schur form, reflectors, data-dependent ranks or block counts beyond what the three samples give) is not measured.

So a JS minimum that is too low on such a path passes the check, and base.js may overrun silently. "Too high" is judged against the largest sampled minimum, so a JS minimum the samples cannot justify fails, even when an unsampled path needs it.

## Evidence

- In ticket 0016's PR, zero data hid the GSVD routines' rank-dependent callees (d/z ggsvp3/ggsvd3: DORMR2 from the right writes M when 0 < L < N). Random data did not reach it either. Only the rank-deficient sample did. The JS minimum there was set from a worst-case reading of the reference's callees, not from the samples.
- The generator's header lists the structured-input limit (`bin/gen-lwmin.mjs`).

## Reproduce

```bash
node bin/workspace-minimum.mjs dggsvp3 --check --no-cache
```

(The check passes; the evidence above is why passing does not prove the minimum.)
