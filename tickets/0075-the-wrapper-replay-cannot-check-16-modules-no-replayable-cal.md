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

## Corpus rerun 2026-11-24

`node bin/wrapper-replay.mjs --all` with per-call watchdogs (ticket 0070). Twenty modules that used to time out now report, and three harness crashes are fixed.

Still untested, 11 modules: dgees dgetv0 dgges dlamch dlaqr4 dsaitr dsaup2 dsaupd dtgex2 zgees zgges. dlaqr4 and dtgex2: the recorded argument count differs from the spec. dseupd and ztgevc are now replayed: a recorded `null` array and a plain boolean array are passed through.

## Update 2026-11-25

- Callbacks are now recorded by their source and rebuilt on replay (test/harness/replay-record.mjs, `decode` in replay.js). A callback that needs its closure throws on replay, and the call is skipped. dgees, zgees and zgges had recorded nothing, because their `select`/`selctg` callback could not be serialized; they now replay 15, 4 and 13 calls.
- Still untested: dgetv0 and dsaitr record 0 calls (reverse communication through a state object); dlaqr4 and dtgex2 have an argument count that differs from the spec.

## Update 2026-11-25 (2)

- Plain objects are now recorded, so ARPACK's state argument no longer drops every call. dgetv0, dsaitr, dsaup2, dsaupd and dsband are replayed and pass.
- dsaup2 needed its WORKL intent corrected to `inout` (spec override; ticket 0082).
- dlaqr4's tests passed a stale trailing `lwork`, which is why its recorded argument count differed from the spec. With that removed, the replay found its wrapper sizing the WR/WI offsets from N instead of IHI (fixed with bin/codemod-vector-lengths.mjs).
- dlamch's `test.ndarray.js` imported `index.js`, so it recorded nothing. It now imports `ndarray.js`.
