# `jsdoc-backtick-params`

Require backtick-quoting of single-char Fortran flags in @param JSDoc.

**Files:** every module source file

Single-character Fortran flags in `@param` descriptions (`'U'`, `'N'`, ...) must be
backtick-quoted so they render as code. Autofixable.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/jsdoc-backtick-params/test.cjs`.
