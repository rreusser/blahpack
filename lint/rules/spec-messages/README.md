# `spec-messages`

**Every error the validation prologue throws carries its canonical message**
(CONVENTIONS V8): `format( '<message>', <args> )` exactly as
[`lint/lib/prologue.cjs`](../../lib/prologue.cjs) generates it.

| Check | Message |
| --- | --- |
| layout | `First argument must be a valid order. Value: \`%s\`.` |
| enum (validator) | `<Nth> argument must be a valid transpose operation` / `matrix triangle` / `operation side` / `diagonal type` |
| enum (whitelist) | `<Nth> argument must be one of the following: "a", "b". Value: \`%s\`.` |
| nonnegative | `<Nth> argument must be a nonnegative integer. Value: \`%d\`.` |
| nonzero | `<Nth> argument must be non-zero. Value: \`%d\`.` |
| ld | `<Nth> argument must be greater than or equal to max(1,%d). Value: \`%d\`.` |
| expr | `<Nth> argument is invalid ([layout: ]rejected when \`<condition>\`). Value: …` |

All start `invalid argument. `; `<Nth>` is the argument's ordinal in that
file's own parameter list. Statements are aligned with the generated prologue
by position; one whose test or error class is wrong is reported by
`spec-prologue`.

Fix: `node bin/codemod-spec/prologue.cjs [routine ...]`.
