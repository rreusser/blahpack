# zher2: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — Four-wide register-blocked Hermitian rank-2 update

The reference (BLAS 3.12.0 `zher2.f`) walks one column of `A` at a time,
updating the stored triangle with the two-term fused update
`A[i,j] += x[i]*temp1 + y[i]*temp2`, where `temp1 = alpha*conj(y[j])` and
`temp2 = conj(alpha)*conj(x[j])`. Our `base.js` selects whichever traversal
walks `A`'s smaller-stride dimension in the inner loop and register-blocks the
other dimension four wide, so a single pass over the vector operands feeds four
output streams:

- **column form** (four columns per pass, hoisting both per-column temporaries
  `temp1` and `temp2` for each of the four columns) when the first dimension
  has the smaller stride;
- **row form** (four rows per pass, hoisting the four row operands `x[i+k]`,
  `y[i+k]`) otherwise.

The 4x4 diagonal corner of each pass and the remainder lines are handled with
reference-style scalar code. Only the stored triangle is read or written; the
reference `x[j] !== 0 || y[j] !== 0` column guard is preserved (in the column
form the four-wide fast path is taken only when all four block columns are
nonzero, otherwise the block falls back to the reference-order scalar columns).

Each element receives exactly the reference two-term fused update in the
reference evaluation order — real part
`(xr*t1r - xi*t1i) + (yr*t2r - yi*t2i)`, imaginary part
`(xr*t1i + xi*t1r) + (yr*t2i + yi*t2r)` — with the temporaries computed exactly
as the reference computes them (a plain 4-mul/2-add complex multiply; no
3-multiply/Gauss trick, which would change rounding).

- **Real diagonal preserved.** The Hermitian diagonal is real by construction:
  the reference stores the real part of `x[j]*temp1 + y[j]*temp2` and writes
  the imaginary part to `0.0` **unconditionally** — including for a zero
  column, where it zeroes the diagonal imaginary part and does nothing else.
  The blocked kernel reproduces this exactly: every stored diagonal has its
  imaginary part written to `0.0`, and its real part receives the reference
  update only when the column pivot is nonzero. This is the top correctness
  risk (a generic complex rank-2 update leaves diagonal imaginary garbage in
  place); it is covered directly by the gate, which initializes `A`'s stored
  diagonal with nonzero garbage imaginary parts.

- **Verification tier**: **bit-identical** (see `docs/optimization-policy.md`).
  The kernel only reschedules memory — each `A[i,j]` receives a single
  reference-order fused update, and no summation is reordered (JS `+`/`*` are
  single IEEE-754 ops) — so it is held to the strict tier rather than a
  tolerance. Gated against the preserved reference kernel with `Object.is`
  over the **FULL interleaved storage** of `A` (which also proves no element
  outside the reference's write set is touched) over 3600 cases spanning
  col/row/general/negative-stride layouts, vector strides `(sx, sy)` in
  `{(1,1), (2,1), (1,2), (-1,1), (1,-1)}`, sizes `0..100`, garbage diagonal
  imaginary parts, zero-guard columns, and complex-alpha specials
  `{0, 1, 0.7-0.4i}` (`bench/zher2-opt/check.mjs`).

- **Measured**: ~1.5–1.8x (median ~1.68x) at `n` in `{100, 500, 2000}`, both
  layouts and both triangles. This is a compute-denser level-2 update than
  `zher` (two fused complex terms per element instead of one), so it is less
  memory-starved; the kernel moves `A`'s stored triangle at ~18–23 GB/s
  (`bench/zher2-opt/bench.mjs`).

- **Oracle preserved**: `bench/zher2-opt/variants/v0-reference.js`.
