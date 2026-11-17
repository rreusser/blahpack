# `workspace-addressing-honored`

base.js must honor the declared offset **and stride** of every caller-owned workspace array it uses.

**Files:** `base.js`

Caller-owned workspace (`WORK`/`RWORK`/`IWORK`/`BWORK`/...) comes with an
`offsetX`. The offset is load-bearing: a driver sub-allocates one caller buffer
among its callees by offset (e.g. `zggevx` keeps an eigenvector pair at
`WORK(1:2N)` and hands `ztgevc` `WORK(2N+1:)`). A kernel that ignores it
silently overwrites the caller's other partitions whenever the offset is
nonzero, and every call site that happens to pass `0` hides the bug
(`test/harness/LEARNINGS.md`, 2026-11-17, ztgevc).

Caller-owned workspace (`WORK`/`RWORK`/`IWORK`/`BWORK`/...) comes with
`strideX, offsetX` in `base.js`/`ndarray.js`. Declared means honored: a
caller passing a nonzero offset or a non-unit stride must get exactly those
elements read and written.

Reported, only when the array itself is referenced in the body:

1. a declared `offsetX` or `strideX` that is never read;
2. the array forwarded to a call with an integer literal `0` where its offset
   goes (`W, s, 0` or `W, s1, s2, 0`), unless one of the next three arguments
   already mentions `offsetX` (the `(array, offset)` pair convention);
3. the array forwarded with a numeric literal where its stride goes (`W, 1, …`);
4. an element access `W[ … ]` (or on a `reinterpret( W, … )` view) whose index
   varies but is never scaled by the stride. Variables and local helper
   functions derived from `strideX` count as scaled.

Accepted: rebasing the offset once at entry (`WORK = WORK.subarray( offsetWork );`)
and then addressing from 0 *with the stride*. A declared but unreferenced
workspace (an unused Fortran argument) is not checked.

The strided `<routine>.js` wrapper takes workspace with no stride
(CONVENTIONS.md D2) and passes `WORK, 1, 0` to base; this rule checks `base.js`
only.

Examples are in [`fixtures/pass`](fixtures/pass) and [`fixtures/fail`](fixtures/fail).
Run `node --test lint/rules/workspace-addressing-honored/test.cjs`.
