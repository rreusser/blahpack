---
id: 0092
title: Options the reference never validates are typed but accept any string at runtime
status: resolved
area: wrappers
opened: 2026-11-25
resolved: 2026-11-25
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

## Resolution

Fixed on branch `slop/gracious-dijkstra-q3yg0i` (ticket 0092 PR).

- **Every input option is checked at runtime against the values of its type.** `lint/lib/prologue.cjs` generates an enum check for each input option the spec has no translated check for. The values come from `spec/options.json` through the same `optionValues` the JSDoc type uses (now in `lint/lib/spec.cjs`). The check sits at the option's position, as the reference orders its own checks. `lint:spec-prologue` keeps `lib/` in step. The base.js fallback ("any other letter") stays, since it is what the reference does; only the public entry points reject.
- **Guard:** `lint/typecheck-config.test.cjs` fails if an input option has no runtime check, or if a check's values differ from its type's. `lint/rules/spec-prologue` has a fail fixture for a missing option check. CONVENTIONS V1 states the rule.
- **How it was permitted:** the prologue was generated only from what the reference checks (`XERBLA`). An option it never checks got no check and no signal that one was missing. Modules that validated by hand did so with no generator and no test behind them.
- **What the regeneration found:**
  - **Hand-written checks the codemod didn't recognize:** dseupd (its "`bmat` must be one of …" message), dlarrc (message built by concatenation), dlaic1 (`JOBS.indexOf`). Each left a dead duplicate after the generated check. `bin/codemod-spec/prologue.cjs` now recognizes any `x !== 'a' && …` TypeError check as an option check, whatever its message.
  - **Duplicate enum values from aliased letters:** the spec generator mapped `1` and `O` to `'one-norm'` twice, so 12 condition estimators (`[dz](gb|ge|gt|tb|tp|tr)con`) tested `norm !== 'one-norm'` twice. ticket 0022 had found the same aliasing in `base.js`. `bin/spec-gen/build.cjs` now dedupes, and `spec/schema.json` requires unique `values`.
  - **Families too broad for routines the reference never checks:** SIDE included `'both'` for every routine. dlarf and the other Householder appliers (12 modules) treated `'both'` as right. `'both'` is now limited to trevc/tgevc/hsein. RFP `TRANSR` took the full TRANS family, so `zlansf( …, 'transpose', … )` ran as conjugate-transpose. TRANSR is now N/T for `d` and N/C for `z`.
  - **dlamch** accepted 25 alternative spellings (`'E'`, `'e'`, `'Epsilon'`, `'scale'` …) through its lookup table, outside its `MachineParameter` type, and no caller used them. The table now has the 10 canonical keys.
- **Tests that asserted the old behaviour:** dlansf/zlansf "an unrecognized norm returns zero" now assert the throw, and that `base.js` still returns 0 as the reference does. dlamch's short-form tests now assert the throw. dlarft/zlarft/dlarrc throw tests passed `2` for an option (fixed by `bin/codemod-spec/test-flags.cjs`).

