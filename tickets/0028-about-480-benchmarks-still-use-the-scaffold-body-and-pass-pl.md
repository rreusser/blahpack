---
id: 0028
title: About 400 hand-written benchmarks are unverified, and 7 routines still time unstructured inputs
status: open
area: benchmarks
opened: 2026-11-20
---

## Problem

The old scaffold benchmark body (`createBenchmark( len ) { const N = len; ... }`) guesses arguments. Many such benchmarks run without throwing but pass meaningless inputs (numbers where arrays go, `len` for every dimension, random non-SPD matrices for factorizations), so they time an early exit or the wrong code path. (`bin/scaffold.py` stopped emitting this template in PR #29.)

This was recorded only as prose ("Not in this PR") in PR #20. The session delegated to regenerate them with `bin/gen-benchmark.mjs` sat idle for two days with 431 uncommitted files in `.claude/worktrees/regen-old-benchmarks-8b5f10` and no record anywhere. It resumed on 2026-11-20 and opened PR #29 (branch `slop/regen-old-benchmarks-8b5f10`), which regenerates 426 benchmarks and makes `scaffold.py` delegate to the generator. PR #29 merged; the structured-input recipes followed. Resolve this ticket when the kept hand-written benchmarks are shown to reach their routines' real code paths and the remaining routines below get structured inputs.

## Evidence

State after the structured-input recipes (`bin/gen-benchmark-recipes.mjs`, branch `slop/structured-bench-inputs`), on top of PR #29:

- 1,423 of 1,824 benchmarks are `bin/gen-benchmark.mjs` output. 330 of them build their inputs with a recipe, which the probe runs and the benchmark emits verbatim:
  - Householder consumers (xORG*/xUNG*/xORM*/xUNM*, xLARFT, xOPGTR/xUPGTR, ...) get reflectors from their producer (xGEQRF, xGEQLF, xGELQF, xGERQF, xGEHRD, xSYTRD/xHETRD, xSPTRD/xHPTRD, xGEBRD).
  - Refinement routines (xGERFS, xPORFS, xSYRFS/xHERFS, xSPRFS/xHPRFS, xPPRFS, xPTRFS, xGTRFS, xLA_*RFSX_EXTENDED) get a real factorization and solution.
  - Positive-definite routines (dense, packed, band, tridiagonal, and B of the generalized drivers) get a dominant real diagonal.
  - Schur-form consumers (xLAEXC, xTREXC, xTGEX2, xTGEXC, xTGSY2, xTGEVC, ...) get upper triangular inputs.
  - xSTEIN gets eigenvalues from DSTEBZ, DDISNA sorted ones, DLASQ2 a positive qd array.
- The generator also reports early exits: a nonzero `info` at N=10 or N=100, or a negative `info` whose argument (from `spec/`) it steps.
- 7 routines still time unstructured inputs. Each needs data from its own algorithm's context, or a storage format no recipe covers:
  - `dlaed6` (secular-equation roots) and `dlarrd`, `dlarrr` (eigenvalue representations): `INFO > 0`.
  - `dlasd2` (deflation inputs): non-finite at N=100.
  - `dpftrf`, `zpftrf` (positive definite in RFP format): `INFO > 0`.
  - `dsygvx` ndarray: `INFO = 2` on some draws.
- 401 hand-written benchmarks are kept and unverified:
  - 169 keep the old `createBenchmark( len )` body with real arrays and a custom call.
  - 197 have custom bodies.
  - 35 are generator files with hand edits.
  `bin/bench-smoke.sh` is 0/1824, but nothing shows that they reach the routine's real code path. `grep -l 'const N = len;' lib/*/base/*/benchmark/*.js` lists 100 of them.

## Reproduce

```bash
node bin/gen-benchmark.mjs lib/lapack/base/dlaed6 lib/lapack/base/dlasd2 lib/lapack/base/dpftrf   # INFO=... / NONFINITE: ...
grep -l 'const N = len;' lib/*/base/*/benchmark/*.js | wc -l
```

## Evidence 2026-11-25 (ticket 0094 caller fixes)

The ticket 0094 fixes made these benchmarks' calls valid, but they still time a trivial path:
- The dlaqge, dlaqgb, dlaqsb, dlaqsp and dlaqsy benchmarks pass condition ratios of 1, so the routine skips scaling and returns at once.
- The dlaqr2 and dlaqr3 benchmarks use a size-1 deflation window.
- The dlaqsp benchmarks' largest size was lowered from 10^6 to 10^3: at N = 10^6 the packed array would need about 5×10^11 elements. Before the fix they passed an AP of length N, so they never actually ran at that size.

The type check cannot see this: the calls are valid, they just do almost nothing.
- Fixed in the ticket 0094 PR: the dorghr, dormhr, zgehrd, zgehd2, zunghr and zunmhr benchmarks passed `ilo = ihi = 1`, to the timed call and to the dgehrd/zgehrd setup. That reduces nothing, so they timed the trivial path. Their siblings dgehrd and dgehd2 use 1..N, and all now do.
