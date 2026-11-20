---
id: 0028
title: Many benchmarks do not exercise the routine they time: about 480 scaffold bodies, and random inputs for factorizations
status: open
area: benchmarks
opened: 2026-11-20
---

## Problem

The old scaffold benchmark body (`createBenchmark( len ) { const N = len; ... }`) guesses arguments. Many such benchmarks run without throwing but pass meaningless inputs (numbers where arrays go, `len` for every dimension, random non-SPD matrices for factorizations), so they time an early exit or the wrong code path. `bin/scaffold.py` still emits this template for new modules.

This was recorded only as prose ("Not in this PR") in PR #20. The session started to regenerate them with `bin/gen-benchmark.mjs` committed nothing: its worktree `.claude/worktrees/regen-old-benchmarks-8b5f10` (branch `slop/regen-old-benchmarks-8b5f10`) holds 431 uncommitted files, 58 commits behind main.

## Evidence

- 482 benchmark files contain the scaffold marker `const N = len;`.
- `bin/scaffold.py:1364` and `:1508` emit `function createBenchmark( len )`.
- Generated benchmarks (`bin/gen-benchmark.mjs`) pass uniform random matrices, so a Cholesky or other factorization that needs an SPD (or otherwise structured) input takes its early-exit path (PR #20, "Not in this PR").
- PR #20, "Not in this PR": "About 606 benchmarks pass the smoke run but still use the old scaffold bodies".

## Reproduce

```bash
grep -l 'const N = len;' lib/*/base/*/benchmark/*.js | wc -l; grep -n 'createBenchmark( len )' bin/scaffold.py
```
