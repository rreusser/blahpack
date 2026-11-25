---
id: 0090
title: check:modules omits the benchmark smoke run CI applies, so broken benchmarks surface only in CI
status: resolved
area: general
opened: 2026-11-25
resolved: 2026-11-25
---

## Problem

`npm run check:modules` is the local pre-push gate for changed modules. It ran four of CI's per-module gates (break-mutants, workspace guard, coverage, wrapper replay) but not the fifth, "Benchmark smoke" (`bin/bench-smoke.sh`, every module benchmark). A module change that breaks its own benchmark therefore passes every local gate and fails only in CI, after a push.

## Evidence

- PR #44 (strict mode) regenerated the `vect` check for dsbgst and zhbgst. Their `benchmark/benchmark.ndarray.js` passed `vect = 'q-only'`, which the new check rejects. `check:modules` passed on all 133 changed modules; CI's Benchmark smoke then failed 2 / 1824. It was fixed in 16e406e12.
- `bin/bench-smoke.sh` took only "all files" or a list file, so it had no way to select changed modules.

## Reproduce

```bash
# on a branch where a changed module's benchmark throws
npm run check:modules   # before the fix: passes
bin/bench-smoke.sh      # fails
```

## Resolution

- `bin/changed-modules.mjs` prints the directories of the modules the corpus gates select with `--changed` (same merge-base logic, `bin/lib/corpus.mjs`).
- `bin/bench-smoke.sh --changed [--base <ref>]` smoke-runs only those modules' benchmarks.
- `check:modules` now ends with `bin/bench-smoke.sh --changed`.
- Verified: with the old dsbgst benchmark restored on the PR #44 branch, `bin/bench-smoke.sh --changed` reported `failing: 1 / 266` and exited 1; with the fix, `0 / 266`.

CI still runs the full smoke run over every benchmark, which also catches a benchmark broken by a change to a dependency.

Found along the way: with an empty file list, GNU `xargs` ran `run` once with no argument, so `bin/bench-smoke.sh` reported `failing: 1 / 0` and exited 1. The `--changed` mode made an empty list reachable; `xargs -r` fixes it.
