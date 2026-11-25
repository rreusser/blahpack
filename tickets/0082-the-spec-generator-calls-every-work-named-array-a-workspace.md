---
id: 0082
title: The spec generator calls every WORK-named array a workspace, including ARPACK arrays that carry state between calls
status: open
area: spec
opened: 2026-11-24
---

## Problem

`bin/spec-gen/build.cjs` (pass 2, roles) gives the role `workspace` to every array whose name matches `WORKSPACE_RE`, whatever its declared intent. A workspace role means scratch storage: the wrapper may allocate it when given `null` (CONVENTIONS D5c), and the wrapper replay passes `null` for it in its `null-work` variant.

ARPACK's reverse-communication arrays are named like workspaces but carry state: `WORKD`/`WORKL` hold the Arnoldi or Lanczos state between calls, and `dseupd` reads `dsaupd`'s results from `WORKL`. For these the spec's own `intent` is `in` or `inout`, but the role ignores it. So:

- the replay reports `dseupd` as rejecting `WORKL = null`, which the wrapper rightly refuses;
- the null-workspace rules (D5c, `bin/workspace-guard.mjs`) would accept a wrapper that silently replaces state it should have read with a fresh, zeroed array.

## Evidence

- Spec params with role `workspace`, by intent: `out` 602, `inout` 9, `in` 1.
- The 10 that are not `out`: `dgetv0.WORKD`, `dsaitr.WORKD`, `dsaup2.WORKD`, `dsaupd.WORKD`, `dsaupd.WORKL`, `dsband.WORKD`, `dsband.WORKL`, `dsband.IWORK`, `dseupd.WORKD`, `dseupd.WORKL`.

## Reproduce

```bash
node bin/wrapper-replay.mjs dseupd
# REJECTED dseupd null-work column-major: invalid argument. workl array must have at least 84 elements. Provided length: 0.
```

## Direction

- Assign `workspace` only when the intent is `out` (pure scratch). Classify a WORK-named array with intent `in`/`inout` by its dims, like any other array.
- Regenerate the affected specs, and let the spec rules (`spec-prologue`, `spec-jsdoc`) and the replay re-check the ARPACK wrappers.

## Update 2026-11-25

- **Replay:** the wrapper replay no longer passes `null` for a workspace whose intent is `in`/`inout`. Its `null-work` variant now keeps the caller's contents for those arrays, so `dseupd` replays cleanly. This is independent of the role question below.
- **Generator, tried and reverted:** assigning `workspace` only for intent `out` reclassified 10 arrays in 6 specs (dgetv0, dsaitr, dsaup2, dsaupd, dsband, dseupd). The strided projection then gives each of them a stride, which changes 6 public wrapper signatures. It also moved dgetv0's S11 return from `IPNTR` to `WORKD`, which would need an override.
- **dsband does not fit the rule.** It is a driver, not a reverse-communication step: for its caller, WORKD/WORKL/IWORK really are scratch (its wrapper allocates them when given `null`), but the extracted intent is `inout`. Intent alone cannot tell "carries state between the caller's calls" from "scratch for a driver".
- **Decision needed:** whether the six signatures change, and what marks a driver's arrays as scratch, probably a spec override with a reason.
