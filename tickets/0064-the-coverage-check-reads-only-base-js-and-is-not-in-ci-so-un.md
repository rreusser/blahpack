---
id: 0064
title: The coverage check reads only base.js and is not in CI, so untested wrapper branches are invisible
status: resolved
area: conformance
opened: 2026-11-22
resolved: 2026-11-23
---

## Problem

`bin/conformance/checks/tests.js` runs each module's tests under `--experimental-test-coverage`, then reads only the `base.js` row of the report (the regexes at lines 112-113). Coverage of `<routine>.js` and `ndarray.js` is computed and thrown away. The check also runs only under `conformance --coverage` (`conformance:full`), which CI does not run, so even `base.js` coverage gates nothing. A wrapper branch that no test reaches (its `WORK = null` allocation, its row-major mapping, its LD checks) is invisible.

## Evidence

- The ticket 0060 bugs (15 wrappers allocating too little on `WORK = null`) survived because no test ran that branch. On the old `dlarf`, coverage reports `dlarf.js` at 81% lines with lines 71-73 (the null branch) uncovered. The signal existed and was discarded.
- `.github/workflows/ci.yml` runs `npm run conformance`, without `--coverage`.
- Worse, the check measured nothing real. It ran only `test/test.js`, the two export-shape tests, so every module "failed" line coverage at about 30%, with branch coverage at 100% because no branch ran (`dlarf` 30.9%, `dpotrf` 34.3%). That is the clustering ticket 0033 noticed.

## Reproduce

```bash
git show d52a3a15b~1:lib/lapack/base/dlarf/lib/dlarf.js > /dev/null  # old wrapper
node --test --experimental-test-coverage --test-coverage-include='lib/lapack/base/dlarf/lib/dlarf.js' lib/lapack/base/dlarf/test/test.dlarf.js 2>&1 | grep dlarf.js
grep -n "base\\.js" bin/conformance/checks/tests.js
```

## Direction

Report every file under `lib/`, and gate line coverage of changed modules in CI (the same `--changed` pattern as the `mutants` and `workspace` jobs).

## Resolution

bin/coverage.mjs runs all of a module's tests once under node's lcov coverage and reports every lib/ file. Thresholds (CONVENTIONS T4): base.js >= 90% lines / 85% branches; <routine>.js and ndarray.js 100% lines and branches. New CI job 'coverage' gates changed modules; conf:tests.coverage-* now use the same measurement (it previously ran only test/test.js, so it measured nothing real). Backlog (881 of 912 modules below the floor): ticket 0069.
