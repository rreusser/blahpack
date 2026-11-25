---
id: 0094
title: tsc checks only lib/, so tests, benchmarks and examples can pass any option string
status: resolved
area: general
opened: 2026-11-25
resolved: 2026-11-25
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

## Resolution

Fixed on branch `slop/gracious-dijkstra-q3yg0i` (ticket 0094 PR) for benchmarks and examples. Tests are ticket 0095.

- **The check:** `tsconfig.callers.json` (`npm run typecheck:callers`, in CI) checks every benchmark and example against `lib/`'s declared types:
  - each call's argument count, array kinds and option strings;
  - `routine.ndarray( … )`;
  - `noImplicitAny`, so an untyped value can't carry an unchecked call.

  `lint/typecheck-config.test.cjs` pins the flag and the include globs.
- **What it needed:**
  - **`main.js` default exports typed with their `ndarray`** (`bin/codemod-spec/main-type.cjs`). `tsc` can't see a property `setReadOnly` adds, so no caller's `.ndarray` call was checked. Lint `module-exports` now requires the typed export, and `bin/scaffold.py` generates it.
  - **`{ dtype }` options objects get literal types** (`bin/codemod-spec/dtype-options.cjs`).
  - **`types/callers/`** narrows stdlib's `uniform`/`discreteUniform`, which return a union whatever the `dtype`, and `bench`, which rejects stdlib's own `@returns {Function}` benchmark convention.
  - **Single-assignment `let`s captured by the benchmark closure are now `const`s** (`bin/codemod-spec/const-lets.cjs`, 970 variables in 188 files).
- **What it found:** 1,077 call errors in 593 files across 491 modules, fixed in 15 agent parts. Then, under `noImplicitAny`, 346 more errors in 29 modules. By class:
  - wrong argument counts left over from signature changes;
  - `Float64Array` passed for `Complex128Array`, `Int32Array` pivots, `Uint8Array` selects and length-1 outputs;
  - invalid option strings (`'1'` for a norm, `'both'` for a job, `'compute'`);
  - numbers passed as booleans;
  - imports of an `ndarray` that `index.js` doesn't export;
  - benchmarks whose `isnan( out )` tested an object or array, so it always passed and hid failures.

  Some benchmarks timed garbage while still "passing":
  - zla_porfsx_extended wrote `A.buffer[ i ]`;
  - zhetrf_rk/zhetrf_rook bracket-assigned into a `Complex128Array`, so all three timed an all-zero matrix;
  - the packed dspr/dtpmv/dtpsv/dlaqsp benchmarks allocated `AP` of length N.
- **Library problems found while fixing callers:**
  - ticket 0096 (dggsvd3 workspace);
  - ticket 0097 (scalar index bases: dhgeqz, dlaqr5, dtgex2);
  - ticket 0098 (index outputs: dlamrg, dstebz);
  - evidence added to tickets 0068, 0087, 0085 and 0028.

