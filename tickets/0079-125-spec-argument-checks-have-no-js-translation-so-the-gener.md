---
id: 0079
title: 125 spec argument checks have no JS translation, so the generated prologue omits them
status: open
area: spec
opened: 2026-11-23
---

## Problem

`bin/spec-gen/build.cjs` records an argument check with `js: null` when it cannot translate the Fortran condition. A check without JS is not part of the generated validation prologue (lint/lib/prologue.cjs), so `ndarray.js` and the wrapper either skip it or carry a hand-written equivalent that nothing compares with the reference: its order, its message, even its existence. CONVENTIONS V1/V3 assume the prologue is the reference's checks.

## Evidence

- 125 checks across the specs have `js: null`.
- `spec/dstebz.json` check INFO = -1 (`IRANGE.LE.0`, where IRANGE is decoded from RANGE) has no JS. dstebz's `ndarray.js` and wrapper check RANGE by hand, after ORDER and N rather than first as in the reference, and the wrapper does so after allocating its workspace. Reported by a wave-2 agent for ticket 0069.

- The expert drivers' scale-factor checks are missing from the generated prologues:
  - dgbsvx INFO = -13 and -14 (with FACT = 'F', R or C must be > 0 when EQUED calls for it; dgbsvx.f lines 459 and 474);
  - dpbsvx and zpbsvx INFO = -11 (S > 0 when FACT = 'F', EQUED = 'Y').

  A zero scale factor is accepted and the solve continues with it. Reported by a wave-3 agent.

## Reproduce

```bash
node -e 'let n=0;for(const f of require("fs").readdirSync("spec")){if(!f.endsWith(".json")||f==="options.json"||f==="schema.json")continue;const x=require("./spec/"+f);if(x.checks)n+=x.checks.filter(c=>c.js===null).length}console.log(n)'
```
