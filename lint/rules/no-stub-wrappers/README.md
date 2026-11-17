# `no-stub-wrappers`

Disallow "not yet implemented" stubs in wrapper files.

**Files:** every module source file except `base.js`

Rejects "not yet implemented" stubs, thrown or as a string literal, left by
scaffolding.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-stub-wrappers/test.cjs`.
