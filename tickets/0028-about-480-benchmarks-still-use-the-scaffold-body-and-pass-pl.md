---
id: 0028
title: Many benchmarks do not exercise the routine they time: about 480 scaffold bodies, and random inputs for factorizations
status: open
area: benchmarks
opened: 2026-11-20
---

## Problem

The old scaffold benchmark body (`createBenchmark( len ) { const N = len; ... }`) guesses arguments. Many such benchmarks run without throwing but pass meaningless inputs (numbers where arrays go, `len` for every dimension, random non-SPD matrices for factorizations), so they time an early exit or the wrong code path. `bin/scaffold.py` still emits this template for new modules.

This was recorded only as prose ("Not in this PR") in PR #20. The session delegated to regenerate them with `bin/gen-benchmark.mjs` sat idle for two days with 431 uncommitted files in `.claude/worktrees/regen-old-benchmarks-8b5f10` and no record anywhere. It resumed on 2026-11-20 and opened PR #29 (branch `slop/regen-old-benchmarks-8b5f10`), which regenerates 426 benchmarks and makes `scaffold.py` delegate to the generator. PR #29 keeps 231 files that still contain `createBenchmark( len )`. Resolve this ticket when PR #29 merges, if those 231 really do exercise their routines.

## Evidence

State after PR #29 (`slop/regen-old-benchmarks-8b5f10`):

- 1,413 of 1,824 benchmarks are `bin/gen-benchmark.mjs` output. The generator restores arrays that repeated in-place calls grow to Inf/NaN (337 benchmarks), checks one call at N=100, and rejects NaN results, including NaN in a returned array. `bin/scaffold.py` no longer emits the guessed-argument template: it delegates to the generator or writes a throwing stub, and conformance `scaffold-noise.benchmark-generated` fails on either.
- 411 hand-written benchmarks were kept unverified. They don't throw (`bin/bench-smoke.sh` is 0/1824), but nothing shows they reach the routine's real code path.
  - 179 keep the old `createBenchmark( len )` body with real arrays and a custom call.
  - 197 have custom bodies (block sizes, structured inputs, ARPACK drivers).
  - 35 are generator files with hand edits (norm-preserving rotations, S10 output scalars).
  - `grep -l 'const N = len;' lib/*/base/*/benchmark/*.js` lists 108 of them.
- 32 modules still get unstructured random inputs that go non-finite within one call, even with inputs restored: dlaexc, dlasd2, zherfs, zhprfs, zlarft, zptrfs, zsprfs, zsyrfs, ztgsy2, zung2l, zung2r, zungbr, zunghr, zungl2, zunglq, zungql, zungqr, zungr2, zungtr, zunm2l, zunm2r, zunmbr, zunmhr, zunml2, zunmlq, zunmql, zunmqr, zunmr2, zunmrq, zunmtr, zupgtr, zupmtr. They need structured generators (Schur form, sorted deflation data, unitary c/s, SPD).

## Reproduce

```bash
grep -l 'const N = len;' lib/*/base/*/benchmark/*.js | wc -l
node bin/gen-benchmark.mjs lib/lapack/base/dlaexc lib/lapack/base/dlasd2   # prints NONFINITE: ...
```
