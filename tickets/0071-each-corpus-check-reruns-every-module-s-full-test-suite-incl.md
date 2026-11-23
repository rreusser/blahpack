---
id: 0071
title: Each corpus check reruns every module's full test suite, including slow harness tests it does not need
status: open
area: tooling
opened: 2026-11-23
---

## Problem

Each corpus check runs every module's complete test suite in its own pass:

- coverage runs all tests under instrumentation;
- the workspace guard runs all tests with workspaces forced to `null`;
- the wrapper replay runs all tests to record `ndarray.js` calls.

The recording pass includes the slow property-based `test.validate.js` files, although the replay keeps at most 40 calls per module and `test.ndarray.js` usually supplies them. So the same tests run three times, mostly for nothing.

## Evidence

- `test/harness/replay.js` `record()` runs every `test/test*.js` file except `test.replay.js`.
- `MAX_CALLS = 40` in the same file.
- The workspace guard's sufficiency check largely overlaps the replay's `native` variant: with `WORK = null`, the expected result comes from an ample workspace, and an undersized allocation shows up as a mismatch.

## Reproduce

```bash
grep -n "MAX_CALLS\|test.replay.js" test/harness/replay.js
```

## Direction

- Record from `test.ndarray.js` first, and fall back to the other test files only when too few calls are recorded.
- Fold the workspace guard into the replay: allocate the replay's `null` workspaces through the guard's sentinel region, so overruns are caught directly. Then retire the guard's separate pass.
