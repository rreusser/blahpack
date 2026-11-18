---
id: 0027
title: Tests cannot tell whether code after an early loop exit should run, and coverage hides it
status: open
area: harness
opened: 2026-11-18
---

## Problem

When a Fortran `GO TO` leaves a loop, the translation has to decide at that exit whether the code between the loop end and the label runs. A plain `break` runs it. Nothing checks that the tests can tell the two choices apart, and line coverage says they can: a wrongly translated exit can be 100% covered and pass every test whenever no test input makes the skipped statement change the result.

## Evidence

- The `*latrs`/`*latps`/`*latbs` growth-bound bug (LEARNINGS 2026-11-18, fixed in 57427401): the faulty `break` was covered in all six routines, but only by singular or tiny-diagonal inputs, where `xbnd` had already collapsed to 0, so running `grow = xbnd` was harmless.
- `python bin/goto-exits.py --translated`: 154 Fortran sites in 65 translated routines exit a loop past code (131 past-code, 19 multi-level, 4 cycle-outer).
- `node bin/break-mutants.mjs zlatrs` against the pre-fix `zlatrs` and its old tests: the `skip-after-break` mutant at the bug site survives. On the fixed family, all non-equivalent mutants are killed.
- Sweep of the remaining routines with break sites: results pending.

## Reproduce

```bash
python bin/goto-exits.py --translated | tail -1
git checkout 57427401~1 -- lib/lapack/base/zlatrs
node bin/break-mutants.mjs zlatrs   # SURVIVED at base.js:298 (the bug)
git checkout HEAD -- lib/lapack/base/zlatrs
```
