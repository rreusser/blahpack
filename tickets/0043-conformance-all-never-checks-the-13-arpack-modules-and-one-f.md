---
id: 0043
title: "`conformance --all` never checks the 13 ARPACK modules, and one fails"
status: resolved
area: conformance
opened: 2026-11-20
resolved: 2026-11-27
---

## Problem

`bin/conformance/util.js` enumerates modules from `[ 'blas', 'lapack' ]` only, so every `--all` run (CI's `conformance:fast` included) reports 899 modules and passes while the 13 under `lib/arpack/base/` are never looked at. Run one by one, `dstqrb` fails.

## Evidence

- `bin/conformance/util.js:79`: `var pkgs = [ 'blas', 'lapack' ];`
- `node bin/conformance.js --all`: "899 complete ... (899 total)"; `lib/` has 912 modules (13 ARPACK).
- `node bin/conformance.js lib/arpack/base/dstqrb`: FAIL "Routine wrapper auto-allocates workspace when null — 1 workspace param(s) lack a null-allocation branch: [WORK]".

## Reproduce

```bash
for m in lib/arpack/base/*; do node bin/conformance.js $m >/dev/null 2>&1 || echo "FAIL $m"; done
```

## Resolution

On branch slop/awesome-wright-lxi5gy, bin/conformance/util.js lists arpack with blas and lapack, so node bin/conformance.js --all checks all 915 modules (was 902) and the CI conformance gate covers the 13 ARPACK modules. All 13 pass (0 failures; dstqrb's missing null-allocation branch cited above had already been fixed). Done alongside exporting ARPACK (ticket 0123).
