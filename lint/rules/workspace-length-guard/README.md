# `workspace-length-guard`

`strided.js` checks the length of every workspace whose minimum the spec knows
(CONVENTIONS W3; ticket 0107).

**Files:** `lib/<pkg>/<routine>/lib/strided.js`, when `spec/<routine>.json`
has a param of role `workspace` whose `minLength.js` is not null.

## Rule

- For each such workspace (`WORK`, `RWORK`, `IWORK`, `BWORK`, ...), the
  exported function holds a guard: an `if` whose test reads `<NAME>.length`
  and whose consequent throws `RangeError`. Names compare case-insensitively
  (S7). The guard may sit inside a zero-dimension condition
  (`if ( N > 0 ) { ... }`).
- Early-return order: a `return` in a top-level statement after the one
  holding the first workspace guard, other than the final statement (the call
  of `base.js`), is reported. A zero-dimension quick return comes before the
  workspace checks: an empty problem needs no workspace, and the JS may accept
  less there, never demand more (W3).

Whether a guard demands the right length, on every path, is not this rule's
job: `ci:workspace-minimum` (`bin/workspace-minimum.mjs`) replays the
reference's minimum through `strided.js`, and the wrapper replay's `min-work`
and `short-work` variants (`test/harness/replay.js`) replay every recorded call
at the minimum `strided.js` demands and one element below it.

## Why

A workspace with no length check runs silently when it is short: typed-array
writes past the end are dropped and reads give `undefined`, so the result is
wrong or NaN. Before this rule only `WORK` was required to have a guard
(`conf:work-assert`), and 74 declared-extent workspaces (`IWORK( N )` in the
`*con`/`*rfs`/`*svx` routines, `RWORK( N )`/`RWORK( 2*N )` in their complex
siblings, `BWORK( N )` in d/z gees) had none.

## Fix

`node bin/codemod-workspace-guard.mjs <routine>` inserts the guard from the
spec's `minLength.js`, immediately before the call of `base.js`, in the style
of the existing WORK guards and with the message the replay parses:

```js
const minRWork = N;
if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
	throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
}
```

When the spec's `minLength` is wrong, fix the spec through `spec/overrides/`
with its reason, not the guard by hand.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/workspace-length-guard/test.cjs`.
