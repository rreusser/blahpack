---
id: 0027
title: Module benchmarks are not run by CI, and 90 of 1,824 throw on main
status: open
area: ci
opened: 2026-11-20
---

## Problem

`bin/bench-smoke.sh` exists and was clean (0 of 1,824 failing) when PR #20 merged on 2026-11-18. No CI job runs it, so PRs #21–#28 changed signatures and argument validation (S10 output scalars, spec prologue, row-major LD bounds, packed `order`) without touching the benchmarks, and 90 broke silently. A benchmark that throws measures nothing, and anyone who runs it sees an error instead of a number.

## Evidence

- `bin/bench-smoke.sh` on main `0be7ea7c8`: `failing: 90 / 1824` (87 lapack, 3 blas).
- Almost every failure is an argument-validation throw from the routine under test: invalid option string (First/Second/Third argument "must be one of"), or an LD/size rule (`rejected when ...`). The rest: `invalid integer` (4), `should not return NaN` (1), `Cannot set/read properties of undefined` (2).
- `.github/workflows/ci.yml` has no benchmark step.

## Reproduce

```bash
bin/bench-smoke.sh; head -20 .bench-smoke/fail.txt
```
