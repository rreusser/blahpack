---
id: 0025
title: Some conformance checks pass vacuously because their applicability test never matches
status: open
area: conformance
opened: 2026-11-18
---

## Problem

A check reports `skip` ("not applicable") when its applicability test does not match. If that test is wrong, the check silently never runs, and the summary looks the same as when it legitimately does not apply. Nothing reports how often each check skips, so a broken test stays invisible. Several checks also accept parts of a routine without checking them, while still reporting `pass` for the routine.

## Evidence

- `implementation.ndarray-dimension-validation` skips 866 of 899 modules ("No dimension params"). Its test is `/@param\s*\{(integer|number)\}[^*]*\b[MNK]\b/`, but dimensions are documented as `{NonNegativeInteger}`, so it matches almost nothing. (`bin/conformance/checks/implementation.js`; `dgemm` is reported as having no dimension params.) It also overlaps `conventions.ndarray-dimension-validation`.
- `conventions.index-native-loading` skips all 899 modules unconditionally ("no native addons in this project"). It is dead code reported as a result.
- Partial checks that still report `pass`:
  - `option-rules` passes options it cannot compare: 12 arguments are `undetermined`, and 88 options `ndarray.js` never validates (ticket 0022).
  - `ld-rules` enforces only column-major for the 10 TSQR-family `'skip'` rules (ticket 0012).
- Most other skips are legitimate: real routines skip complex checks, and routines without workspace skip workspace checks.
- Dead checks cited in CONVENTIONS: N8 `conf:scaffold-noise.no-wrapper-string-map` matches only `var`, which N4 bans, and T3 `conf:scaffold-noise.ndarray-test-routes-through-validator` matches only `require(`, which ESM tests never contain. Both pass on every module because they never apply.

## Reproduce

```bash
node bin/conformance.js --all --fast --json > /tmp/conf.json; node -e 'const r=require("/tmp/conf.json").modules;const s={};for(const m of r)for(const c of m.checks)if(c.status==="skip")s[c.id]=(s[c.id]||0)+1;Object.entries(s).sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(([k,v])=>console.log(v,k))'
```
