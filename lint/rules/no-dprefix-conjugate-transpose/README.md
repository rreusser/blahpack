# `no-dprefix-conjugate-transpose`

Disallow "conjugate-transpose" in d-prefix (real-valued) routines.

**Files:** every file of a `d`-prefix (real) routine

Real routines have no conjugate transpose; the literal `'conjugate-transpose'`
is a copy-paste remnant from the complex variant. Autofix replaces it with
`'transpose'`.

Comments are checked too (no autofix). JSDoc copied from the Fortran often documents `TRANS = 'C'` as `'conjugate-transpose'`, which a real routine does not accept. That clause has to be removed, not substituted.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-dprefix-conjugate-transpose/test.cjs`.
