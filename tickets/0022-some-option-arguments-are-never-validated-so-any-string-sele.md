---
id: 0022
title: Some option arguments are never validated, so any string selects a default branch
status: resolved
area: wrappers
opened: 2026-11-18
resolved: 2026-11-25
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

## Resolution

Fixed on branch `slop/gracious-dijkstra-q3yg0i` (ticket 0022 PR).

- **Every input option is typed as the literal union of its values.** `lint/lib/jsdoc-spec.cjs` takes the values from the spec's enum check (what the reference accepts for that routine), else from the option's `spec/options.json` family. `lint:spec-jsdoc` makes `lib/` agree, and `ci:typecheck` (strict `tsc`) then rejects two things:
  - a call that passes any other string;
  - a `base.js` comparison against a string the option can never hold.

  That closes the CONVENTIONS N8 gap ("validator ≡ base-dispatch set (unbuilt)") structurally, with no project-specific check. `lint/typecheck-config.test.cjs` fails if any input option is typed other than as a literal union.
- **Every option the reference validates now has canonical values.** New families: BALANC, SENSE, JOBV (gsvj0/1), EIGSRC, INITV, TYPE (lascl), PIVOT, ID, JOB (tgsna/trsna, trsen), TRANS_TYPE, BMAT, WHICH, HOWMNY (dseupd, dsband), JOB (laic1), IDENT and JOBT. No spec enum check has `values: null`, so the generated prologue validates each of these options at runtime.
- **What the types found** (each fixed, with a regression test that fails on the old code where behaviour changed):
  - **dtgsja/ztgsja:** `ndarray.js` accepted `'compute-vectors'`, but `base.js` dispatches on `'update'`. A public call silently skipped updating U, V and Q. The canonical value is now `'update'`, matching COMPQ's.
  - **dgges:** it called `dlascl( 'hessenberg', ... )`. `dlascl` returned -1, which `dgges` ignored, so a scaled input's Schur form came back unscaled. The tests ran that branch but asserted only `info`; they now assert S.
  - **dlacpy/dlaset/zlacpy/zlaset callers:** they spelled "whole matrix" as `'all'`, `'full'`, `'Full'`, `'ALL'` and `'none'`. The family now has `other: 'all'`, and every caller passes `'all'`.
  - **zhsein vs dhsein:** zhsein used `'no'`/`'no'` where dhsein uses `'no-source'`/`'no-init'`. zhsein now uses dhsein's spelling.
  - **dggev, dggevx, zggev, zggevx:** they reused `chtemp` for both the dhgeqz job and the dtgevc side, as the Fortran does. The side is now its own variable.
  - **dlanst, dlansy, zlange, zlanhe:** each had a duplicated `'one-norm'` test, left over from the reference's two letters, O and 1.
- **Remaining:** options the reference never validates (it raises no `XERBLA`) are typed, but still accept any string at runtime. Ticket 0092 tracks this; it is where the `dlansf` evidence above now belongs.
