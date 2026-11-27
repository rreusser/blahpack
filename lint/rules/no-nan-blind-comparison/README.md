# `no-nan-blind-comparison`

A test failure is never guarded by a comparison that is false on NaN
(CONVENTIONS T2a; ticket 0081).

**Files:** test files: `lib/**/test/**/*.js` and `test/harness/**` (any path
with a `/test/` segment; module sources are skipped).

## Rule

Every ordered comparison with NaN (`<`, `<=`, `>`, `>=`) is false. A check
written as "fail when the error is too big" therefore never fails on a NaN
result:

```js
if ( Math.abs( actual - expected ) > tol ) {   // false for NaN: passes garbage
	throw new Error( ... );
}
```

Reported:

- an `if` whose condition is NaN-blind and whose consequent records a failure.
  - **NaN-blind condition:** an ordered comparison of a floating-point
    quantity: one side has `Math.abs`/`sqrt`/`hypot`/`log`/`exp`/`pow`, a
    division, a non-integer literal, or a name like `tol`, `eps`, `err`,
    `diff`, `resid`, `rel`, `norm`, `dist`, `delta`, `ulp`, `thresh`, `scale`.
    Through `||` every disjunct counts; through `&&` only the last conjunct
    (earlier ones are usually size or index guards).
  - **Failure:** a `throw`, `assert.fail( ... )` or `t.fail( ... )`,
    `assert.ok( false )`/`assert( false )`, `return false`, a push onto
    `errors`/`failures`/`mismatches`/..., or `ok`/`pass`/`match*`/... `= false`.
    Nested functions in the consequent are not searched.
- `assert.ok( !( <NaN-blind comparison> ) )`: the negation of a NaN-false
  comparison is NaN-true.

Accepted:

- the passing condition, stated so NaN fails it:
  `if ( !( Math.abs( actual - expected ) <= tol ) ) { throw ... }`, or
  `assert.ok( Math.abs( actual - expected ) <= tol, ... )`;
- a failure in the `else` of `if ( err <= tol )`;
- a comparison whose operand the enclosing function also checks with
  `Number.isNaN`, `isNaN`, `isFinite` (or `<x>.isNaN`/`<x>.isFinite`), or
  `x !== x`;
- comparisons of integers: sizes, pivots, block sizes, iteration counters
  (`if ( info > 0 )`, `if ( N - 1 <= NB )`, `if ( iters > 100 )`).

## Why

The first value-mutant survey (ticket 0093) found 11 test files whose
comparison helpers passed NaN results: zsyr's fixture tests passed on an
all-NaN `A`. Test files were not linted, so nothing stopped a new one; this
rule found 21 more in 20 module tests and one in the harness (`assertZeroBlock`
in `test/harness/checks.js`, blind to a NaN `scale`). See
`test/harness/LEARNINGS.md`.

## Fix

Negate the passing condition: `if ( a > tol )` becomes `if ( !( a <= tol ) )`,
and `if ( a > tol && b > tol )` becomes `if ( !( a <= tol || b <= tol ) )`.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass)
and [`fixtures/fail`](fixtures/fail). Run
`node --test lint/rules/no-nan-blind-comparison/test.cjs`.
