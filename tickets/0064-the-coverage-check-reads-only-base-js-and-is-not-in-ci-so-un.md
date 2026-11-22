---
id: 0064
title: The coverage check reads only base.js and is not in CI, so untested wrapper branches are invisible
status: open
area: conformance
opened: 2026-11-22
---

## Problem

`bin/conformance/checks/tests.js` runs each module's tests under `--experimental-test-coverage`, then reads only the `base.js` row of the report (the regexes at lines 112-113). Coverage of `<routine>.js` and `ndarray.js` is computed and thrown away. The check also runs only under `conformance --coverage` (`conformance:full`), which CI does not run, so even `base.js` coverage gates nothing. A wrapper branch that no test reaches (its `WORK = null` allocation, its row-major mapping, its LD checks) is invisible.

## Evidence

- The ticket 0060 bugs (15 wrappers allocating too little on `WORK = null`) survived because no test ran that branch. On the old `dlarf`, coverage reports `dlarf.js` at 81% lines with lines 71-73 (the null branch) uncovered. The signal existed and was discarded.
- `.github/workflows/ci.yml` runs `npm run conformance`, without `--coverage`.

## Reproduce

```bash
git show d52a3a15b~1:lib/lapack/base/dlarf/lib/dlarf.js > /dev/null  # old wrapper
node --test --experimental-test-coverage --test-coverage-include='lib/lapack/base/dlarf/lib/dlarf.js' lib/lapack/base/dlarf/test/test.dlarf.js 2>&1 | grep dlarf.js
grep -n "base\\.js" bin/conformance/checks/tests.js
```

## Direction

Report every file under `lib/`, and gate line coverage of changed modules in CI (the same `--changed` pattern as the `mutants` and `workspace` jobs).
