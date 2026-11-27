# zgeru: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — register-blocked, layout-adaptive rank-1 update

The reference (BLAS 3.12.0 `zgeru.f`) walks `A` one column at a time, updating
each column with a plain `A(i,j) += x(i) * (alpha*y(j))` inner loop over rows.
Our `base.js` register-blocks the update four wide and adapts to `A`'s storage:

- **column form** (four columns per pass, hoisting `temp = alpha*y[j+k]` for
  the four columns) when the first dimension of `A` has the smaller stride, so
  each streamed `x(i)` is reused against four cached column scalars;
- **row form** (four rows per pass, hoisting `x[i+k]`) otherwise, so the
  reference's inefficient large-stride inner walk becomes a unit(ish)-stride
  traversal of `A`'s second dimension.

This is the complex analog of the shipped `dger` blocked kernel
(`bench/dger-opt/`).

- **Verification tier**: **bit-identical** (`docs/optimization-policy.md`). The
  kernel only reschedules memory — it never reorders dependent arithmetic. Each
  `A(i,j)` receives exactly one fused update `x(i) * (alpha*y(j))` computed with
  the identical floating-point expression as the reference
  (`re += xr*tr - xi*ti; im += xr*ti + xi*tr`, with
  `tr = alphaRe*yr - alphaIm*yi`, `ti = alphaIm*yr + alphaRe*yi`), and the
  reference `y(j) !== 0` column guard is preserved (the four-wide block runs
  only when all four columns are non-zero; otherwise it falls back to
  reference-style scalar columns). The gate compares the **full** `A` storage
  buffer bitwise via `Object.is`, which also proves no entry outside the
  reference footprint is ever written — 19,440 cases in
  `bench/zger-opt/check.mjs` (both routines: 38,880 total), 0 failures.
- **Measured speedup**: ~1.6x (column-major, the reference's native layout) and
  up to ~1.8x (row-major, large) with no case slower than the reference;
  `bench/zger-opt/bench.mjs`.
- **Oracle preserved**: `bench/zger-opt/variants/v0-zgeru.js`.
