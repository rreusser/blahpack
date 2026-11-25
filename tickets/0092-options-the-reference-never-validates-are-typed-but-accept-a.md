---
id: 0092
title: Options the reference never validates are typed but accept any string at runtime
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

Every input option is typed as the literal union of its values (ticket 0022), so `tsc` rejects a misspelled option in this repo's own code. A plain-JS caller of the public API gets no compile step, so for them only the runtime check in `ndarray.js` and `<routine>.js` stands between a typo and a silently wrong result.

That runtime check is generated from the spec's enum checks, which exist only where the reference validates the argument (`XERBLA`). Auxiliary routines usually don't. For those options, `base.js` tests one or two values and treats any other string as the remaining case. For example, `dlansf( 'one_norm', ... )` returns 0 rather than throwing.

## Evidence

- About 112 input options in 83 modules have no enum check and no `!==` test in `ndarray.js`. Examples: `dlansf.norm` and `dlansb.norm`, `dla_gbamv.trans`, `dla_porcond.uplo`, `dlagtm.trans`, `dlaic1.job`.
- `dlansf` and `zlansf` tests assert this behaviour: "an unrecognized norm returns zero" (see ticket 0022's evidence).
- Some modules validate such options by hand, such as `dlacpy`'s `uplo`. Nothing generates or checks those validators.

## Reproduce

```bash
node -e '
const fs=require("fs");let n=0,mods=new Set();
for(const f of fs.readdirSync("spec")){if(!/^[a-z].*\.json$/.test(f)||f==="options.json"||f==="schema.json")continue;
const s=JSON.parse(fs.readFileSync("spec/"+f));const chk=new Set((s.checks||[]).filter(c=>c.kind==="enum").map(c=>c.param));
for(const p of s.params||[]){if(p.role!=="flag"||p.intent!=="in"||chk.has(p.fortran))continue;
 const file=["blas","lapack","arpack"].map(k=>"lib/"+k+"/base/"+s.routine+"/lib/ndarray.js").find(x=>fs.existsSync(x));if(!file)continue;
 if(new RegExp("\\b"+p.name+"\\s*!==").test(fs.readFileSync(file,"utf8")))continue;n++;mods.add(s.routine);}}
console.log(n,"options unvalidated at runtime in",mods.size,"modules")'
```
