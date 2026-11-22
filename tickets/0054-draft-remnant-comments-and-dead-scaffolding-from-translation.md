---
id: 0054
title: Draft-remnant comments and dead scaffolding from translation are not detected in shipped code
status: open
area: conformance
opened: 2026-11-20
---

## Problem

Translations were sometimes left with drafting artifacts: comments like "Let me redo", "Actually ...", "wrong: ...", and dead scaffolding loops. At least once the artifact was live code: in `zhbgst`, a superseded draft line ran before the correct version and corrupted a value the rotation then read. Conformance checks for stray translator-attribution comments, but not for drafting remnants, so nothing flags them.

## Evidence

- `grep -rnE "//.*(Let me |Actually[,:]|wrong:|redo|Hmm|Wait,|I think|let's )" lib/*/base/*/lib/*.js` gives 20 lines in 15 files (2026-11-20).
- `zhbgst`: a live "wrong:" line and a dead `while ( true ) { … break; }` scaffold, with "Let me restructure" comments, were removed 2026-11-20 (LEARNINGS). Its kb >= 2 path is still wrong (ticket 0053).

## Reproduce

```bash
grep -rnE "//.*(Let me |Actually[,:]|wrong:|redo|Hmm|Wait,|I think|let's )" lib/*/base/*/lib/*.js | wc -l
```
