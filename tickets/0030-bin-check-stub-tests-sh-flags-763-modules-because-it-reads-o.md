---
id: 0030
title: `bin/check-stub-tests.sh` flags 763 modules because it reads only `test/test.js`
status: open
area: conformance
opened: 2026-11-20
---

## Problem

The script counts `test(` calls and `assert.` lines in `test/test.js` only. Modules now keep that file to the two export checks and put real tests in `test.ndarray.js`, `test.<routine>.js` and `test.validate.js`, so the script reports almost every module as scaffold-only and exits 1. A check that always fails is as useless as one that never runs. CONVENTIONS T2 is already enforced by `conf:tests.assertion-count`, so the script may be redundant rather than in need of a fix.

## Evidence

- `bash bin/check-stub-tests.sh`: `ERROR: 763 modules have scaffold-only tests`, e.g. `lib/lapack/base/zunmtr`, which has 7 tests in `test.zunmtr.js` and 10 in `test.ndarray.js`.
- Not referenced by CI or any npm script.

## Reproduce

```bash
bash bin/check-stub-tests.sh | head -3; grep -c '^test(' lib/lapack/base/zunmtr/test/*.js
```
