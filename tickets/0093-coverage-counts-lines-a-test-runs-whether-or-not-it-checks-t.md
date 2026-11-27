---
id: 0093
title: Coverage counts lines a test runs whether or not it checks their result, so untested branches pass the floor
status: resolved
area: tests
opened: 2026-11-25
resolved: 2026-11-27
---

## Problem

The coverage floor (CONVENTIONS T4) counts a line as covered once any test executes it. A test that runs a branch and asserts only `info`, or `typeof info === 'number'`, or nothing, raises coverage exactly as much as one that checks the branch's output. A branch that computes a wrong result therefore passes both the tests and the coverage gate.

## Evidence

- **dgges (ticket 0022):** two tests ran the scale-A branch (tiny and huge norm) and asserted only `info`. Meanwhile `dgges` called `dlascl( 'hessenberg', ... )`, which `dlascl` rejects, so S came back unscaled. `tsc` found it, not the tests.
- **Ticket 0069 coverage waves (2026-11-25):** the agents found tests like this:
  - **zgsvj1:** "returns nsweep-1 when not converged", "zero-norm column sentinel", "small-norm branch" and "large-norm branch" assert only `typeof info === 'number'`.
  - **zhetrd_he2hb:** "accepts a caller-provided WORK buffer" runs on an all-zero matrix and checks only `info`.
  - **zgbbrd:** two "path executes" tests checked only `info` on zero matrices; replaced.
  - **dlarfb, zgbtf2 and others:** wrapper throw tests passed arguments in the wrong positions, so they threw for an unrelated reason but still covered the throw line.
- `break-mutants` checks this for `break` statements only.

## Reproduce

```bash
grep -rlE "typeof info" lib/*/base/*/test/*.js
grep -n "only check\|path executes" -r lib/*/base/*/test/*.js | head
```

## Evidence 2026-11-27 (ticket 0108 PR)

- zlahef's upper branch searched its row max one element short (`izamax( k - imax - 1, … )` for the reference's `K-IMAX`), so zhetrf's upper blocked path chose pivots the reference does not: 49 of 70 on a random N = 70 Hermitian matrix. The branch was fully covered. zlahef's upper tests compare only with themselves, zhetrf's N = 70 upper tests assert `info === 0`, and the validate test checks a residual that any valid pivot choice passes. The replay's `min-work` variant found it once zhetrf's guard message was readable. It is fixed, with Fortran fixtures for the upper blocked path; see the LEARNINGS entry of 2026-11-27.

## Evidence 2026-11-27 (value mutants)

- **Built**: `bin/value-mutants.mjs` (with `bin/value-mutants-reporter.mjs`; it reuses `bin/break-mutants-loader.mjs` and the corpus pool and cache, which gained a per-module `scope` so a diff-scoped result is cached apart from a whole-module one). Operators: `e - 1` -> `e`, `e + 1` -> `e`, a count argument (`role: dim` in the callee's spec) one short, `<`/`<=` and `>`/`>=` swapped in an `if`/loop/conditional test, and an assignment or call deleted from an `if`/`else` branch. Each mutant runs the module's own tests one file at a time, stopping at the first failing test; a hang is killed at 10 s + 3x the clean run and counts as killed. Keys are content fingerprints, as in `break-mutants`. Proven equivalences go in `test/value-mutants.equivalent.json`; `--check` fails on unexplained survivors and stale entries. The `value-mutants` CI job runs `npm run mutants:value` (`--changed --check`: only `base.js` lines changed since the merge-base). CONVENTIONS T4a names it.
- **Self-test** (`bin/lib/value-mutants.test.mjs`): on the fixed zlahef, the mutant `k - imax` -> `( k - imax ) - 1` (the old bug) survives zhetrf's tests as they were before PR #58 (`test/harness/fixtures/value-mutants/zhetrf-pre58/test.ndarray.js`) and is killed by the current ones. On a copy of the old zlahef, the mutant `k - imax - 1` -> `k - imax` survives the old tests, so the tool would have flagged the buggy line.
- **zlahef's own tests did not kill the line either**: only zhetrf's `upper_66_*` tests did. zlahef now has Fortran fixtures for its upper branch (N = 66, NB = 64 and 8), and all 5 mutants on that line are killed.
- **Survey**, whole-module, 55 modules (the 25 of PR #58, and 30 chosen by hash over BLAS levels 1, 2 and 3 and LAPACK drivers and computational routines, real and complex): 4548 mutants, 60.6% killed. The first run had 1806 survivors, and triage brought that to 1787 unexplained, with 5 proven equivalent. Survivors by operator: boundary 65%, delete-stmt 32%, the off-by-one operators 31 to 34%. 16 minutes on 4 CPUs.
- **Found by the survey**: 11 test files compared with `if ( Math.abs( a - b ) > tol ) fail`, which passes NaN (zsyr's fixture tests passed on an all-NaN A). They are fixed, and there is a LEARNINGS entry. zaxpy, dscal and zsyr never checked that a call leaves elements past N alone. They now have tests for it.
- **What remains**: survivors in unchanged code (ticket 0110). Test files are not linted, so a new NaN-blind helper is caught only where a mutant makes a result NaN (ticket 0081).

## Resolution

Every `base.js` line a change adds or edits must now be checked by a test, not only run (CONVENTIONS T4a). `ci:value-mutants` (`bin/value-mutants.mjs --changed --check`) applies five value mutations to those lines: `e - 1` → `e`, `e + 1` → `e`, a callee count one short, `<`↔`<=` / `>`↔`>=`, and deleting a statement in a branch. It runs the module's own tests on each mutant. A survivor fails unless `test/value-mutants.equivalent.json` proves it equivalent. A self-test shows that the gate flags the zlahef off-by-one against the tests that existed before PR #58, and passes with the current ones.

Remaining, ticketed separately:
- survivors in code no change touches, about 40% in the survey: ticket 0110;
- NaN-blind comparisons in test files, which nothing lints: ticket 0081.
