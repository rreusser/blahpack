---
id: 0011
title: Helper routines without a clean mathematical property are not checked against the reference Fortran
status: open
area: harness
opened: 2026-11-18
---

## Problem

About 270 unvalidated routines are `dla*`/`zla*` helpers (scaling, norm estimates, small kernels) with no natural reconstruction or residual property. Hand-picked fixtures are their only check, even though the reference Fortran is the project's correctness baseline and could be run on random inputs.

## Evidence

269 of the 567 unvalidated modules match `^[dz]la`.

## Reproduce

```bash
node bin/validation-level.js 2>&1 | awk '$2 ~ /^L/ {print $1}' | sort > /tmp/v.txt; ls lib/lapack/base | sort | comm -23 - /tmp/v.txt | grep -c '^[dz]la'
```
