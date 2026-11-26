# `wrapper-calls-ndarray`

A layout wrapper whose routine takes a workspace calls `ndarray.js`, not
`base.js` (CONVENTIONS D5d; ticket 0077).

**Files:** `lib/<pkg>/base/<routine>/lib/<routine>.js`, when
`spec/<routine>.json` has a param of role `workspace`.

## Rule

- The wrapper does not import the default export of `./base.js` (under any
  local name, or as a namespace). Named helpers `base.js` exports, such as
  `computeOptimalWorkSize` for sizing the `null` allocation, may still be
  imported.
- The wrapper calls the default export of `./ndarray.js`.

## Why

`ndarray.js` is the one layer that validates a workspace: its length against
the reference's minimum (W3, tied to the reference by `ci:workspace-minimum`)
and its stride (D5b). A wrapper that calls `base.js` hands a caller's WORK,
RWORK or IWORK to the algorithm unchecked; when it is shorter than the
minimum, typed-array writes past the end are dropped and reads give
`undefined`, and the result is silently NaN or wrong. Before this rule the
validation was hand-copied into both layers, and 422 of 434 wrappers had no
check on a caller's WORK.

The behavioral counterpart is the wrapper replay's `short-work` variant
(`test/harness/replay.js`, `ci:wrapper-replay`): every recorded call is
replayed through the wrapper with each workspace one element shorter than the
minimum `ndarray.js` demands, and must throw `RangeError`.

## Fix

`node bin/codemod-wrapper-ndarray.mjs <routine>` rewrites
`import base from './base.js';` to `import ndarray from './ndarray.js';` and
each `base(` call to `ndarray(` (keeping named helper imports), when the two
files take the same parameters.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/wrapper-calls-ndarray/test.cjs`.
