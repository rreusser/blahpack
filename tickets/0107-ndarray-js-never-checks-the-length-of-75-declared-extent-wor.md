---
id: 0107
title: ndarray.js never checks the length of 75 declared-extent workspaces (IWORK, RWORK, BWORK)
status: open
area: workspace
opened: 2026-11-26
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
