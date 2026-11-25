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
