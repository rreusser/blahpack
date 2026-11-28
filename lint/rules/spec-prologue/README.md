# `spec-prologue`

**The validation prologue of `strided.js` and `<routine>.js` is exactly the one
generated from the spec's argument checks.**

[`lint/lib/prologue.cjs`](../../lib/prologue.cjs) turns every translated
reference check (`INFO = -k`, `spec.checks[].js`) into one statement

```js
if ( <test> ) {
	throw new <TypeError|RangeError>( format( '<canonical message>', <args> ) );
}
```

in reference order, after the layout check `!isLayout( order )` (wrapper only,
D1/V6). The rule checks that the function body — after any uninitialized `let`
declarations — starts with those statements, with the generated test and
error class (the message is `spec-messages`' job).

How the generator maps a check:

| Spec check | Generated test | Error |
| --- | --- | --- |
| `enum` with a stdlib validator (trans/uplo/side/diag) | `!isTransposeOperation( trans )` … (V9) | `TypeError` |
| other `enum` | `x !== 'a' && x !== 'b'` (Appendix A values) | `TypeError` |
| `nonnegative` | `N < 0` | `RangeError` |
| `nonzero` on an INC | `strideX === 0` (V7) | `RangeError` |
| `ld` / `expr` on an LD (wrapper only) | the reference bound; with `rowMajor`, one statement per layout (V5) | `RangeError` |
| other `expr` | the translated condition | by dtype |
| none, on an input option (ticket 0092) | `x !== 'a' && x !== 'b'` over the values of the option's type, at the option's position | `TypeError` |

An output scalar is read as `x[ 0 ]` (S10), an `element` scalar as
`x[ offsetX ]`, and a scalar index the JS takes 0-based (`base: 0`) is restated
1-based. An input option the reference never checks (or checks in a way the
generator could not translate) gets an enum check over the values of its type
(`spec/options.json`, CONVENTIONS V1), so a plain-JS caller's typo throws
rather than silently taking the reference's "any other letter" case
(`fixtures/fail/missing-option-check.js`). A check naming something the form lacks (an LD in `strided.js`) or that
the generator could not translate (`js: null`) is not generated.

Statements after the prologue — quick returns, workspace checks (W3, D5b),
validation of things the generator can't translate — are not constrained.

Fix: `node bin/codemod-spec/prologue.cjs [routine ...]` rewrites the prologue
and its imports.

Supersedes the conformance checks `ld-rules`, `option-rules`, `option-parity`,
`conventions.routine-{string,dimension,ld}-validation`,
`conventions.strided-{string,dimension}-validation` and
`implementation.strided-{string,dimension}-validation`.
