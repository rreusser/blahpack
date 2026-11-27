---
id: 0114
title: bench/profile-zhgeqz.js does not run, and its map from zhgeqz line numbers to code sections is stale
status: open
area: bench
opened: 2026-11-27
---

## Problem

`bench/profile-zhgeqz.js` profiles `zhgeqz` with V8's CPU profiler and attributes samples to named code sections. It cannot run, and making it load would not make it right: it attributes samples through a hard-coded table of line ranges in `lib/lapack/base/zhgeqz/lib/base.js` that no longer matches that file, so it would report times against the wrong sections.

## Evidence

- `bench/profile-zhgeqz.js:12` uses `require` in an ES module package, so the script fails at load.
- `:80` calls `zggev` with the single-letter flags `'V'`/`'N'` and without the `WORK`/`RWORK` arguments the routine now takes.
- `:91` (`SECTIONS`) maps line ranges of `zhgeqz/lib/base.js` to section names, and the ranges have drifted: lines 1061–1086 are labelled "QZ sweep: left rotation (H+T cols)", but line 1061 is now inside the shift computation and the left rotation starts at line 1109.
- Its sibling scripts were repaired on 2026-11-27 (ticket 0109): `bench/instrument.js` is now an ES module with a loader hook, and `bench/bench-zggev.js` runs on it and gives a per-routine breakdown of the same workload.

## Reproduce

```bash
node bench/profile-zhgeqz.js 2>&1 | grep -m1 Error; sed -n 1061p lib/lapack/base/zhgeqz/lib/base.js; grep -n 'Apply rotation from left' lib/lapack/base/zhgeqz/lib/base.js
```
