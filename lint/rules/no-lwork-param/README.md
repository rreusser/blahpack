# `no-lwork-param`

Disallow a vestigial workspace-length parameter (lwork/liwork/lrwork); derive the length from WORK.length.

**Files:** every module source file

A workspace-length parameter (`lwork`, `liwork`, `lrwork`, ...) is redundant in JS:
a typed array carries its own `.length`, so the available workspace is
`WORK.length - offsetWork`. A local variable computed from the array is fine.
`LD*` leading dimensions are deliberately not matched.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-lwork-param/test.cjs`.
