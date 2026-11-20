---
id: 0033
title: The `base.js` coverage floor (T4) is not checked in CI
status: open
area: ci
opened: 2026-11-20
---

## Problem

CONVENTIONS T4 sets a floor of 90% lines and 85% branches for `base.js`. Its enforcers, `conf:tests.coverage-line` and `conf:tests.coverage-branch`, run only under `node bin/conformance.js --coverage` (`npm run conformance:full`), which CI does not run. Untested code can grow without any signal.

## Evidence

- `.github/workflows/ci.yml` runs `conformance:fast` only.
- CONVENTIONS T4 enforcer: "(not in CI: needs `--coverage`)".

- `node bin/conformance.js --all --coverage` on main `0be7ea7c8` (about 25 minutes locally) exits 1: 858 of 887 modules fail the line floor and 51 the branch floor.
- The numbers look like a measurement bug, not real coverage: values cluster exactly (130 modules at 46.8%, 63 at 30.4%, 54 at 59.3%), and `zupgtr`/`zupmtr` both report 19.3%. The check probably measures more than `base.js`, or runs a test file that doesn't reach it. Until that is understood, T4 states a floor nobody can see.

## Reproduce

```bash
grep -n 'conformance' .github/workflows/ci.yml; npm run -s conformance:full 2>&1 | tail -5
```
