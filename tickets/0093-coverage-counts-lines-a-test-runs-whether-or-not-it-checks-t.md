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
