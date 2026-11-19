# `workspace-addressing-honored`

Caller-owned workspace contract (`CONVENTIONS.md` D5): `base.js` honors
the declared offset; a declared stride is either rejected by `ndarray.js` or
honored by `base.js`.

**Files:** `base.js`, `ndarray.js`

Workspace is unobservable scratch, so its two addressing parameters have
different jobs:

* **Offset — load-bearing.** A driver reuses one caller buffer by handing each
  callee a slice. A kernel that ignores the offset overwrites the caller's
  other slices whenever it is nonzero (`test/harness/LEARNINGS.md`,
  2026-11-17, ztgevc).
* **Stride — unit only.** Kept in the signature for parity with stdlib's
  ndarray shape; nothing needs strided scratch. Supporting non-unit strides is
  a future feature.

Reported in `base.js`, only when the array itself is referenced:

1. a declared `offsetX` that is never read;
2. the array forwarded with an integer literal `0` where its offset goes
   (`W, s, 0` or `W, s1, s2, 0`), unless one of the next three arguments
   mentions `offsetX` (the `(array, offset)` pair convention).

Rebasing once (`WORK = WORK.subarray( offsetWork );`) honors the offset, and
`reinterpret( W, 0 )` builds a view rather than forwarding.

Reported in `ndarray.js`: a workspace whose `strideX` is neither compared
against `1` (the rejection) nor honored by the sibling `base.js`. Honored
means the stride is read, the array is never forwarded with a literal stride,
and every varying element index is scaled by a value derived from the stride.
That is the branch a `WORK`-named documented output takes (`dlasd5`).

Examples are in [`fixtures/pass`](fixtures/pass) and [`fixtures/fail`](fixtures/fail).
Run `node --test lint/rules/workspace-addressing-honored/test.cjs`.
