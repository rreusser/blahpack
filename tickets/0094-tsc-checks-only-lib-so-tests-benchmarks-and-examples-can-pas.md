---
id: 0094
title: tsc checks only lib/, so tests, benchmarks and examples can pass any option string
status: open
area: general
opened: 2026-11-25
---

## Problem

`tsconfig.json` includes only `lib/*/base/*/lib/*.js`. Since ticket 0022, `tsc` rejects a misspelled option in library code, and since ticket 0092 the public entry points reject one at runtime. Neither reaches code outside `lib/*/lib/`: tests, benchmarks and examples call the API with whatever strings they like.

- A wrong string in a benchmark used to silently time the "any other letter" branch. Now it throws, but only `bench-smoke` sees that.
- A test that passes a bad option where it meant a real one either tests the wrong branch, or throws first and no longer reaches the check it means to test. `bin/codemod-spec/test-flags.cjs` exists only to repair the second case after the fact.

## Evidence

- `lib/lapack/base/dlaic1/benchmark/benchmark.js:59` passed `'epsilon'` as dlaic1's job, so the benchmark timed the smallest-singular-value branch. Found by bench-smoke after ticket 0092 added the runtime check.
- In the ticket 0022 PR, six benchmarks (the tgsja ones with `'compute-vectors'`, and zhsein's) passed values outside their option's type. They too were found only by bench-smoke.
- In the ticket 0092 PR, the dlarft/zlarft/dlarrc throw tests passed `2` for an option.
- Scale: 3,090 test files, 1,824 benchmarks and 912 example files are outside the type check.

## Reproduce

```bash
grep -n '"include"' -A4 tsconfig.json
```

## Progress 2026-11-25

On branch `slop/gracious-dijkstra-q3yg0i`:
- **Infrastructure:**
  - `tsconfig.callers.json` checks benchmarks and examples, with `npm run typecheck:callers` in CI.
  - `main.js` default exports are typed with their `ndarray` (`bin/codemod-spec/main-type.cjs`, enforced by lint `module-exports`).
  - `{ dtype }` options objects have literal types (`bin/codemod-spec/dtype-options.cjs`).
  - `types/callers/` narrows stdlib's `uniform`, `discreteUniform` and `bench`.
  - `bin/examples-smoke.sh` runs in CI (ticket 0041).
- **What the check found:** 1,077 errors in 593 files across 491 modules. That covers 327 of the 332 examples that throw, plus 121 examples and 145 benchmark files that run but make invalid calls.
- **Fixing:** the errors are being fixed in agent waves of 5. The module partitions are `/tmp/claude-0/s/fixpart-NN` (15 parts), and the brief is `/tmp/claude-0/s/cbrief.md`.
- **Out of scope:** tests are ticket 0095.
