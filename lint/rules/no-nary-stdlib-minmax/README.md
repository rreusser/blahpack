# `no-nary-stdlib-minmax`

Disallow calling the stdlib `max`/`min` with more than two arguments.

**Files:** every module source file

`@stdlib/math/base/special/max`, `.../min` and their `fast/` variants are
binary — `max( 1, M, N )` returns `max( 1, M )` and silently ignores `N`. This
produced under-sized default workspaces and under-validated leading dimensions
(e.g. Fortran `LDB.LT.MAX( 1, M, N )` translated verbatim). Nest the calls —
`max( 1, max( M, N ) )` — or use the variadic `Math.max`.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-nary-stdlib-minmax/test.cjs`.
