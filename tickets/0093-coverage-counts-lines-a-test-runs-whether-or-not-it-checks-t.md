---
id: 0093
title: Coverage counts lines a test runs whether or not it checks their result, so untested branches pass the floor
status: open
area: tests
opened: 2026-11-25
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
