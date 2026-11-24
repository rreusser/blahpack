---
id: 0075
title: The wrapper replay cannot check 16 modules: no replayable call, a timeout, or a harness crash
status: open
area: harness
opened: 2026-11-23
---

## Problem

`bin/wrapper-replay.mjs` cannot check 16 modules, so their wrappers stay unverified.

## Evidence

- No replayable `ndarray.js` call (11): dlamch dsaupd zgges dlaqr4 dsaitr zgees dgges dgees dgetv0 dsaup2 dtgex2. Callback arguments (`SELCTG`) are not recorded, and some modules' tests never call `ndarray.js` validly.
- Timeouts or crashes (5): dlarrb (timed out), dlarrj (timed out), ztgevc (exit 1: (file:///home/user/blahpack/test), dseupd (exit 1: (file:///home/user/blahpack/test), ztgsyl (exit 1: (file:///home/user/blahpack/test). The crashes are in the harness itself (`replay.js` comparison and toWrapper paths).

## Reproduce

```bash
node bin/wrapper-replay.mjs dgees dlarrb ztgevc
```
