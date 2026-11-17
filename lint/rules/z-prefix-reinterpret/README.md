# `z-prefix-reinterpret`

Require reinterpret() in z-prefix routines that index complex arrays.

**Files:** `base.js` of a `z`-prefix (complex) routine

Indexing a Float64 view of a complex array (`Av[...]`, `Xv[...]`, ...) requires
the view to come from `reinterpret()`, so complex strides and offsets are
doubled correctly.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/z-prefix-reinterpret/test.cjs`.
