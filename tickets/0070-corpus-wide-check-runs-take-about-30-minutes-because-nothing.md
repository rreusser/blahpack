---
id: 0070
title: Corpus-wide check runs take about 30 minutes because nothing caches per-module results
status: open
area: tooling
opened: 2026-11-23
---

## Problem

The per-module checks (`bin/coverage.mjs`, `bin/workspace-guard.mjs`, `bin/wrapper-replay.mjs`, `bin/break-mutants.mjs`) recompute everything on every run. A whole-corpus run, needed to size or re-measure a backlog, takes about 30 minutes on 4 cores, even when only a few modules changed since the last run. This slows development: every re-measurement after a batch of fixes costs the full time.

## Evidence

- `node bin/wrapper-replay.mjs` over 912 modules in 4 shards: about 30 minutes. One module (`dgeqrf`) takes 1.7 s, against 1.0 s for its plain test run.
- The coverage and workspace-guard corpus runs on the same branch took similar times.

## Reproduce

```bash
time node bin/wrapper-replay.mjs dgeqrf
```

## Direction

- Cache each module's result (recording, coverage report, guard report) in a git-ignored directory. Key each entry on a hash of the module's `lib/` and `test/` files, plus the tool's own source, so that a rerun redoes only modules whose inputs changed.
- Run one worker pool sized to the CPU count, with `--test-concurrency=1` in each child, instead of fixed shards that each start a parallel `node --test`.
