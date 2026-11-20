---
id: 0029
title: The type check fails with 75 errors in 23 modules, and CI does not run it
status: open
area: typecheck
opened: 2026-11-20
---

## Problem

`npm run typecheck` (`tsc -p tsconfig.json`, added in PR #21) exits 2 on main. CI never runs it, so errors accumulate. Some are real bugs, not type noise: a comparison that can never be true is dead code or a wrong branch.

## Evidence

- 75 errors; 58 are TS2367 ("this comparison appears to be unintentional ... no overlap").
- `lib/arpack/base/dseupd/lib/base.js:250`: `select[ ... ] === false` on a `number` element — never true, so the `rghtptr` branch is unreachable.
- `lib/lapack/base/ztgevc/lib/ztgevc.js:76`: `M < 0` where `M` is an `Int32Array` (S10 made it an array); the check never fires.
- `lib/lapack/base/ztgsen/lib/ndarray.js:95`: arithmetic on a non-number.
- The `*svx` wrappers (`dgbsvx`, `dgesvx`, `zgbsvx`, `zgesvx`: 8 each; `dposvx`, `dppsvx`, `dpbsvx`, `z`-versions: 4 each) have generated prologue conditions that re-test `fact` inside a branch where it is already fixed (`fact === 'factored' && ... fact === 'not-factored'`).
- Modules: dgbsvx dgesvx zgbsvx zgesvx dposvx dppsvx dpbsvx zposvx zppsvx zpbsvx dseupd ztgsen zggevx dtrevc dtrevc3 ztgevc zggev zgges zgees dtgsna dtgsen dlasq3 dgees.

Related: 0003 (stdlib imports resolve to `any`) and 0023 (non-strict) — both make the check weaker; this ticket is that even the weak check fails and is ungated.

## Reproduce

```bash
npm run -s typecheck 2>&1 | grep -c 'error TS'
```
