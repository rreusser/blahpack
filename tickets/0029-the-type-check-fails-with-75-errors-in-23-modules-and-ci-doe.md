---
id: 0029
title: The type check fails with 75 errors in 23 modules, and CI does not run it
status: resolved
area: typecheck
opened: 2026-11-20
resolved: 2026-11-25
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

## Resolution

`npm run typecheck` exits 0 and runs in CI's lint job (CONVENTIONS S14). Since this ticket was opened the errors had fallen to 19. Loading stdlib's real types (ticket 0003) made it 22, in 13 modules. All are fixed:
- two wrong results: dseupd's `Uint8Array` select compared `=== false`, and zgges never returned `INFO = N+3`;
- three checks that could not work: ztgsen's workspace size, and the dtgsen/ztgevc `M < 0` checks;
- several values right only by coercion (dlasq3, dgees, zgees, zggev, zggevx, dtrevc, dtrevc3, dtgsna).

Details and tests are in test/harness/LEARNINGS.md, 2026-11-25. `lint/verify-no-escape-hatches.cjs` now rejects `@ts-ignore`, `@ts-nocheck` and `@ts-expect-error`, so the gate cannot be bypassed in source. Strictness stays in ticket 0023, and test files in ticket 0004.
