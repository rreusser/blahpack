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

## Evidence 2026-11-27 (pilot wave: 8 modules, 3 agents)

| Module | Mutants | Survived before | Killed by new tests | Proven equivalent | Left |
|---|---|---|---|---|---|
| dgsvj0 | 524 | 206 | 66 | 75 | 65 |
| zgsvj0 | 493 | 219 | 68 | 80 | 71 |
| dlatbs | 216 | 143 | 111 | 29 | 3 |
| dlarrf | 112 | 58 | 46 | 12 | 0 |
| dlarrd | 209 | 87 | 47 | 25 | 20 |
| zlahef | 379 | 154 | 110 | 35 | 0 |
| dtgexc | 104 | 61 | 50 | 5 | 6 |
| dgeevx | 133 | 94 | 74 | 14 | 6 |

- **Real defects found (each fixed, with a regression test that fails on the old code, and a LEARNINGS entry):**
  - d/z gsvj0, and by extension d/z gsvj1: at N = 0 they wrote SVA(0), outside the array.
  - dlarrd: it went on after DLAEBZ failed to converge, where the reference returns INFO = IINFO. An existing test asserted the wrong output.
  - d/z geevx: an invented N = 1 shortcut returned RCONDV = 1 instead of |A(1,1)|. Existing tests asserted the wrong output.
- **Found and ticketed:** 0117 (DLARRD's reference writes IBLOCK(0)), 0118 (garbled dgeevx/dgeev fixtures), 0119 (dgehrd differs by about 1e-9 on a graded matrix), 0120 (fixtures that don't regenerate).
- **What is left, by class:**
  - **Rounding-level differences** (the largest class). The JS ddot groups terms in blocks of 5 and dnrm2 has a four-accumulator fast path, while the reference adds left to right, so no bit-exact oracle exists for M ≥ 4.
  - Exact float-equality thresholds.
  - Convergence bookkeeping that cannot change the result.
  - Error paths no input reaches.
  - Deletions of `sumsq = 1`, which only differ after NaN, and the JSONL fixtures cannot hold NaN.
- **Cost:** about 1.24M agent tokens for 8 modules, about 155k per module, and roughly 245 to 530 new Fortran reference cases per large module.
- **What would make the rest cheap (tooling):**
  - Compare reference fixtures bit for bit (`Object.is`): the pilot's modules all match gfortran -O2 exactly.
  - A test-only reference-order summation mode for ddot and dnrm2.
  - A fixture format that can hold NaN and Inf.
  - A padding helper that runs every fixture case with LD > N, offset and strided vectors, and sentinels.
  - Exact-threshold input generators (0, ±1, dyadic values, SMLNUM, BIGNUM, eps).
  - A mutant-explorer script that fuzzes one mutant against the original and emits the first input that tells them apart as a Fortran case.
