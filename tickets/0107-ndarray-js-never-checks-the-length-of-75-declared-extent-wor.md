---
id: 0107
title: ndarray.js never checks the length of 75 declared-extent workspaces (IWORK, RWORK, BWORK)
status: resolved
area: workspace
opened: 2026-11-26
resolved: 2026-11-26
---

## Problem

75 workspace parameters, in about 70 modules, have no length check in `ndarray.js`. Nearly all are workspaces whose size the reference declares and that have no length argument: `IWORK( N )` in the `*con`/`*rfs`/`*svx` routines, `RWORK( N )` or `RWORK( 2*N )` in their complex siblings, `BWORK( N )` in d/z gees. A caller passing a short one gets no error. Typed-array writes past the end are dropped and reads give `undefined`, so the result is silently wrong or NaN. Since CONVENTIONS D5d (ticket 0077) the wrappers go through `ndarray.js`, so this is now the only gap left between a caller's workspace and the algorithm.

How it was permitted:
- `conf:work-assert` checks only that a `WORK` guard exists.
- `ci:workspace-minimum` covers routines with a length argument. For a declared extent, W3 says accepting less is *reported, not failed*. Most of these routines are not in `data/fortran-lwmin.json` at all.
- The wrapper replay's `short-work` variant skips a workspace whose minimum it doesn't know, which covers every one of these.

## Evidence

- `zpbsvx`'s `ndarray.js` checks WORK but not RWORK (`length at least N` in its JSDoc). `RWORK = new Float64Array( 1 )` with N = 3 raises no error (first reported under ticket 0077).
- The command below lists all 75 as `routine:WORKSPACE`. A trailing `*` marks a routine that does have rows in `data/fortran-lwmin.json`: dgees, dsygvx, dsysvx, dtgsna, zgees, zgeev, zgeevx, zhegv, zhegvx, zhgeqz and ztrsna.

## Reproduce

```bash
node -e '
const fs=require("fs");const lw=require("./data/fortran-lwmin.json");const have=new Set(Object.keys(lw.routines||{}));let miss=[];
for(const f of fs.readdirSync("spec")){if(!/^[a-z0-9_]+\.json$/.test(f)||f==="options.json"||f==="schema.json")continue;
const s=require("./spec/"+f);const p=["blas","lapack","arpack"].map(k=>"lib/"+k+"/base/"+s.routine+"/lib/ndarray.js").find(x=>fs.existsSync(x));if(!p)continue;
const src=fs.readFileSync(p,"utf8");for(const w of (s.params||[]).filter(p=>p.role==="workspace"))if(!new RegExp("\\b"+w.name+"\\.length","i").test(src))miss.push(s.routine+":"+w.name+(have.has(s.routine)?"*":""));}
console.log(miss.length, miss.join(" "))'
```

## Direction

The check belongs where the minimum is known, not hand-copied per module. Options:
- A `conf`/lint check that every spec workspace param has a length guard in `ndarray.js`, generalizing `conf:work-assert` beyond `WORK`.
- Let `gen-lwmin` record declared extents for routines without a length argument, and make `workspace-minimum` fail below one. The JS may accept less only at a zero dimension (W3).
- Codemod the guard from the spec's declared extent.

## Evidence (2026-11-26, fix in progress)

- **Before**: the Reproduce command listed 75 (74 with a spec `minLength.js`, plus dsband's `IWORK( * )` with `minLength: null`). `bin/workspace-minimum.mjs --all` reported 2,236 row-workspaces `below a declared extent` (19 workspaces in 14 modules, none failing). Over the 69 modules the wrapper replay ran 7,103 variants: `short-work`/`min-work` skipped every one of these workspaces, having no minimum to read.
- **Reproduce of the harm** (zpbsvx, FACT = 'N', UPLO = 'U', N = 3, KD = 1, NRHS = 1, a Hermitian positive definite band): `RWORK = new Float64Array( 1 )` gave INFO = 0, RCOND = 0.3246 instead of 0.2574, FERR = BERR = NaN.
- **Enforcer**: lint rule `workspace-length-guard` (every spec workspace with a `minLength.js` has a guard in `ndarray.js` that throws `RangeError`; no `return` after the first guard but the call of `base.js`). `bin/workspace-minimum.mjs` now fails `below declared` at non-zero dimensions. Codemod `bin/codemod-workspace-guard.mjs` inserted 75 guards in 70 files (dsband's minimum, N, from its doc via `spec/overrides/dsband.json`).
- **Exposed**: 7 conditional guards below the declared extent on paths that do not reference the workspace (d/z ggevx IWORK and BWORK, dtrsna and ztgsna IWORK, dsyevx IWORK at N = 1), now unconditional but N = 0; zggevx's four guards had a message the replay cannot parse (now canonical; 23 other modules have the same, ticket 0108); test callers sized to the old checks (dgbrfs, zpprfs, dggevx, dsyevx, zggevx, ztgsna) and the ztgsna example and README.
- **After**: the Reproduce command lists 0; the lint rule reports 0; `workspace-minimum --all --check` has 0 failing rows (0 below a declared extent); the replay runs 9,198 variants over the same 69 modules (each of them gained some), with no mismatch.

## Resolution

Every spec workspace with a known minimum (`minLength.js`) now has a length guard in `ndarray.js`. The guards were written by `bin/codemod-workspace-guard.mjs` from the spec, not by hand, and `lint:workspace-length-guard` requires them. `ci:workspace-minimum` now fails a workspace shorter than the declared extent at any non-zero dimension. The replay's `short-work` and `min-work` variants read the new guards, so they now cover these workspaces.

Remaining, ticketed separately:
- 23 `ndarray.js` guards use a message the replay cannot parse (ticket 0108).
- `conf:work-assert` now duplicates the new rule for `WORK` (ticket 0031).
