---
id: 0012
title: Row-major layout of TSQR-family `T` arrays is unverified
status: open
area: wrappers
opened: 2026-11-18
---

## Problem

The block-structured `T` arrays of the TSQR/TSLQ family (`latsqr`, `laswlq`, `lamtsqr`, `lamswlq`, `orgtsqr`, `orgtsqr_row`, `orhr_col`, and their `z` counterparts) have no verified row-major meaning. Their row-major leading-dimension rules are marked `'skip'`, so only column-major is enforced.

## Evidence

- 10 `'LDT': 'skip'` entries in `bin/conformance/ld-rules.js`.
- LEARNINGS.md #52: the `dtplqt`/`ztplqt` tests compared row-major `T` against column-major data.

## Reproduce

```bash
grep -n "'LDT': 'skip'" bin/conformance/ld-rules.js
```
