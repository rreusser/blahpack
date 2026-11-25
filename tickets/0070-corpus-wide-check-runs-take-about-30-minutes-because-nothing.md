---
id: 0070
title: Corpus-wide check runs take about 30 minutes because nothing caches per-module results
status: resolved
area: tooling
opened: 2026-11-23
resolved: 2026-11-24
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

## Resolution

`bin/lib/corpus.mjs` is shared by the four tools: module selection, a result cache, and a worker pool.

- **Cache:** results are stored in `.cache/checks/<tool>/<routine>.json` (git-ignored). Each entry is keyed on a hash of:
  - every file in the module's directory, plus `spec/<r>.json`;
  - the transitive closure of local files those files import or name, including other modules' `lib/`, `test/harness/` and fixtures;
  - the tool's own closure, plus loaders named in `extraFiles`;
  - `package-lock.json`, the node version, and the tool's environment variables.

  Error results are never cached. `--no-cache` bypasses the cache, and `--slowest <n>` reports where the time goes.
- **Pool:** one worker per CPU (`--jobs <n>`). Each `node --test` gets `--test-concurrency=<cpus/jobs>`.
- **Tests:** `bin/lib/corpus.test.mjs`, run as `npm run test:tools` in CI's unit job. Writing them found that the file-hash memo ignored edits made within one process; the memo is now keyed on mtime and size.

Corpus `--all` on 4 CPUs, after the change:

| tool | cold | warm (nothing changed) |
| --- | --- | --- |
| wrapper-replay | 384 s (was about 30 min) | 0.8 s |
| coverage | 717 s | 0.8 s |
| workspace-guard | 148 s | 0.9 s |
| break-mutants | 532 s (dlasq2 alone takes 122 s) | 0.8 s |

The replay's cold time also fell because of a harness fix found here. Twenty modules hung in a probe and each used up the 180 s module timeout. Every replay call now runs under a `vm` watchdog (test/harness/LEARNINGS.md, 2026-11-24). Three harness crashes on recorded `null` arrays or plain boolean arrays are fixed too. With all modules reporting again, the updated finding lists went to tickets 0068, 0072–0075, plus the new ticket 0082.

All four tools give the same results as before on an 8-module sample, compared as JSON. The guard and break-mutants report 0 errors over the corpus.

