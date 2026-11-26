---
id: 0099
title: ndarray.js quick returns can skip outputs the reference's quick return sets
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

Some `ndarray.js` files repeat a quick return (`if ( N === 0 ) { return … }`) before calling `base.js`. CONVENTIONS V10 allows that. But the reference's quick return often sets an output first: `TAU = ZERO`, `RANK = 0`, `Z( 1, 1 ) = ONE`. The spec records these as `quickReturn[].sets`. A hand-written repeat that only returns leaves the output stale, while `base.js` (and the reference) would have set it.

How it was permitted:
- the wrapper replay (tickets 0065/0074) compares `<routine>.js` with `ndarray.js`, so a quick return both entry points share is invisible to it;
- nothing compares an `ndarray.js` quick return with the spec's `sets`;
- the existing zero-size tests start the output at 0, so a skipped `= 0` write passes them.

## Evidence

- **Fixed in the ticket 0094 PR, each with a regression test that fails on the old code:**
  - dlarfg, zlarfg and zlarfgp left `tau` stale at N = 0; zlarfgp's wrapper had the same early return;
  - dgelss left `rank` stale at M = 0 or N = 0.
- **Still unchecked:** the command below lists the `ndarray.js` files with an early `return` whose spec's quick return sets something other than `WORK( 1 )`, the workspace-query answer the JS API has no equivalent for. That is dlaswlq, dlatsqr, dpteqr, dsyev and zheev. Their `sets` may apply under a different condition than the JS early return (e.g. dsyev's `W( 1 ) = A( 1, 1 )` is the N = 1 case).

## Reproduce

```bash
node -e '
const fs=require("fs");for(const f of fs.readdirSync("spec")){if(!/^[a-z].*\.json$/.test(f)||f==="options.json"||f==="schema.json")continue;
const s=require("./spec/"+f);const qr=(s.quickReturn||[]).filter(q=>q.sets&&q.sets.length&&!q.sets.every(x=>/^WORK\( 1 \)/.test(x)));if(!qr.length)continue;
const p=["blas","lapack","arpack"].map(k=>"lib/"+k+"/base/"+s.routine+"/lib/ndarray.js").find(x=>fs.existsSync(x));if(!p)continue;
if(/\n\tif \([^\n]*\) \{\n\t\treturn [^\n]*;\n\t\}/.test(fs.readFileSync(p,"utf8")))console.log(s.routine,JSON.stringify(qr.map(q=>q.sets)))}'
```

## Evidence 2026-11-26

- dgeqp3 and zgeqp3 `base.js` return before initializing JPVT when min(M,N) = 0. The reference still runs its column-pivot setup there (`JPVT(J) = J` for free columns when M = 0 and N > 0). Found while fixing their workspace adaptation (ticket 0100); left unchanged.
