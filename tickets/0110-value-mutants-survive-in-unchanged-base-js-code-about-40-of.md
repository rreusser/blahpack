---
id: 0110
title: Value mutants survive in unchanged base.js code: about 40% of a 55-module sample, with no test or equivalence proof
status: open
area: tests
opened: 2026-11-27
---

## Problem

`bin/value-mutants.mjs` (CONVENTIONS T4a; ticket 0093) gates only the `base.js` lines a PR adds or changes. In code no PR has touched since, most modules have mutants that survive their own tests: a `± 1` dropped, a count argument one short, `<`/`<=` or `>`/`>=` swapped, or a statement deleted from a branch, and no test fails. Each one is either code whose result no test checks, or an equivalence nobody has proved. Until they are triaged, a regression in that code passes CI as long as it does not touch a changed line.

## Evidence

Survey of 2026-11-27, whole-module mode, 55 modules: the 25 that PR #58 touched, plus 30 chosen by hash across BLAS levels 1, 2 and 3, LAPACK drivers and computational routines, real and complex (`ztbmv` … `dspsv`, listed in ticket 0093's evidence).

- 4548 mutants: 2756 killed (60.6%; 72 by timeout), 5 proven equivalent, 1787 survive.
- Survivors by operator: boundary 628 of 961 (65%), delete-stmt 742 of 2308 (32%), count-short 176 of 514 (34%), minus-one-dropped 167 of 542 (31%), plus-one-dropped 74 of 223 (33%).
- Largest: zgsvj0 219 of 493, dgsvj0 206 of 524, zgsvj1 154 of 278, dgsvj1 158 of 301, zlahef 154 of 388, dlatbs 143 of 216, dgeevx 94 of 143, dlarrd 87 of 210, dtgexc 61 of 104, dlarrf 58 of 112, zheevr 42 of 75.
- Classes seen while triaging:
  - **Loop overruns** (`i < N` -> `i <= N`): the extra iteration writes one element past the call's N. Tests that size every array exactly cannot see it, because the write falls off the end of the typed array. zaxpy, dscal and zsyr had this; they now have tests with a longer buffer.
  - **Zero-count guards** (`N <= 0` -> `N < 0`, `m > 0` -> `m >= 0`): usually equivalent, because the guarded code does nothing at the boundary. Each still needs its proof written down; four are recorded in `test/value-mutants.equivalent.json`.
  - **Blocking thresholds** (`nb < K` -> `nb <= K`, `lwork < iws`, `nx < K` in dgeqlf, dsytrf, zhetrd, …): blocked and unblocked paths agree up to rounding, so tolerance tests cannot tell them apart. This is not a proven equivalence. It needs a test that compares bit for bit, or a reference fixture at the threshold.
  - **Self-correcting downstream code**: in zhesvx and dspsvx, copying one row or column too few into X before `*trs` survives, because `*rfs` iterative refinement repairs X.
  - **Branches checked only by `info`**: dgsvj0/zgsvj0/dgsvj1/zgsvj1 and dlatbs survivors cluster in the convergence and scaling branches (ticket 0069's waves found the same tests asserting only `typeof info`).

## Reproduce

```bash
node bin/value-mutants.mjs --summary zgsvj0 dlatbs dgeqlf zhesvx
node bin/value-mutants.mjs dgeqlf          # lists each survivor with its site
```
