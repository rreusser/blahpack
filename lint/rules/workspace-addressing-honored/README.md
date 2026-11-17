# `workspace-addressing-honored`

base.js must honor the declared offset of every caller-owned workspace array it uses.

**Files:** `base.js`

Caller-owned workspace (`WORK`/`RWORK`/`IWORK`/`BWORK`/...) comes with an
`offsetX`. The offset is load-bearing: a driver sub-allocates one caller buffer
among its callees by offset (e.g. `zggevx` keeps an eigenvector pair at
`WORK(1:2N)` and hands `ztgevc` `WORK(2N+1:)`). A kernel that ignores it
silently overwrites the caller's other partitions whenever the offset is
nonzero, and every call site that happens to pass `0` hides the bug
(`test/harness/LEARNINGS.md`, 2026-11-17, ztgevc).

Reported, only when the array itself is referenced in the body:

1. a declared `offsetX` that is never read;
2. the array forwarded to a call with an integer literal `0` where its offset
   goes (`W, s, 0` or `W, s1, s2, 0`), unless one of the next three arguments
   already mentions `offsetX` (the `(array, offset)` pair convention).

Accepted: rebasing once at entry (`WORK = WORK.subarray( offsetWork );`) and
then addressing from 0 — a view, not an allocation. A declared but
unreferenced workspace (an unused Fortran argument) is not checked.

Strides are deliberately out of scope here: whether opaque workspace should
carry a stride at all is an open convention decision (see lint/README.md).

Examples are in [`fixtures/pass`](fixtures/pass) and [`fixtures/fail`](fixtures/fail).
Run `node --test lint/rules/workspace-addressing-honored/test.cjs`.
