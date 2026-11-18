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
