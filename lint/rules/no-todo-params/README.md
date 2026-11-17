# `no-todo-params`

Disallow TODO remnants in @param JSDoc tags.

**Files:** every module source file

Rejects `TODO` in `@param` descriptions and `{TODO}` type annotations left by
scaffolding.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-todo-params/test.cjs`.
