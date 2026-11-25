---
id: 0022
title: Some option arguments are never validated, so any string selects a default branch
status: open
area: wrappers
opened: 2026-11-18
---

## Problem

For 88 CHARACTER option arguments that the reference validates, `ndarray.js` does not validate the JS option at all. `base.js` usually tests a single value (`jobz === 'compute-vectors'`) and treats everything else as the alternative. A typo such as `'compute-vector'` therefore silently computes no eigenvectors instead of throwing.

The `option-rules` check (ticket 0014) skips these arguments because there is no JS set to compare. They can't be fixed mechanically: in 72 of the 88, `base.js` compares against fewer strings than the reference has letters, so the JS vocabulary for the remaining values (`'no-vectors'`, `'none'`, ...) has to be chosen per option.

## Evidence

- `fact` in every `*svx` expert driver (reference E/F/N; `base.js` tests 1–2 values).
- `jobz` in `dsbev`, `dsbevx`, `dsygv`, `dsyevr` and `dspgv`; `range` in `dsygvx` and `dspgvx`; `norm` in `dtrcon`, `dtpcon` and `dtbcon` (reference I/O).
- `howmny` in `dtgevc`/`dtrevc3`; `transr` in `dpftri`; `normin` in `dlatbs`/`dlatps`; `sort` in `dgges`; `way` in `dsyconv`.
- In 16 of the 88, `base.js` already compares against as many values as the reference accepts; those could be generated.
- CONVENTIONS N8 cites this ticket: nothing checks that the strings a validator accepts are the strings `base.js` dispatches on.

## Reproduce

```bash
node -e '
const fs=require("fs"),path=require("path");
const R=require("./data/fortran-option-rules.json");
const {optionSets}=require("./bin/conformance/checks/option-parity.js");
let n=0;
for(const pkg of ["blas","lapack","arpack"]){const d="lib/"+pkg+"/base";if(!fs.existsSync(d))continue;
 for(const r of fs.readdirSync(d)){const f=path.join(d,r,"lib/ndarray.js");if(!fs.existsSync(f)||!R[r])continue;
  const S=optionSets(fs.readFileSync(f,"utf8"));
  for(const P in R[r]){if(R[r][P].accepts!=="undetermined"&&!S[P.toLowerCase()]){n++;console.log(r+"."+P.toLowerCase(),R[r][P].accepts);}}}}
console.log(n,"unvalidated");' | tail -5
```

## Evidence 2026-11-25

`dlansf` and `zlansf`: `ndarray.js` does not validate `norm`, so an unrecognised value reaches `base.js`, which returns 0. Tests added under ticket 0069 assert that current behaviour ("an unrecognized norm returns zero"). When validation is added here, those tests must change to expect the TypeError.

## Evidence 2026-11-25 (2): options with no canonical values get no generated check

When `spec/options.json` has no entry for an option family, the spec's enum check carries `values: null`, and the generated prologue validates nothing. A hand-written check may then fill the gap wrongly:
- dsbgst/zhbgst accepted only `'update'`, so the reference's `VECT = 'N'` (`'none'`) threw. That is now fixed with an options entry, and the replay found it (strict-mode PR).

Still without canonical values (each option accepts the letters shown):
- `BALANC` 'BNPS': dgeevx, dggevx, zgeevx, zggevx
- `SENSE` 'BENV': dggevx, zggevx
- `JOBV` 'ANV': dgsvj0, dgsvj1, zgsvj0, zgsvj1
- `EIGSRC` 'NQ' and `INITV` 'NU': dhsein, zhsein
- `TYPE` 'BGHLQUZ': dlascl, zlascl
- `PIVOT` 'BTV': dlasr, zlasr
- `ID` 'DI': dlasrt
- `JOB` 'BEV': dtgsna, dtrsna, ztgsna, ztrsna
- `JOB` 'BENV': dtrsen, ztrsen

List them with:

```bash
node -e 'const fs=require("fs");for(const f of fs.readdirSync("spec")){if(!/^[a-z].*\.json$/.test(f)||f==="options.json"||f==="schema.json")continue;const s=JSON.parse(fs.readFileSync("spec/"+f));for(const c of s.checks||[])if(c.kind==="enum"&&!c.values)console.log(f,c.param)}'
```

Each needs an options entry spelling the values the code already compares against, then regeneration with `bin/codemod-spec/prologue.cjs`. Any test that relied on the missing check must change with it.
