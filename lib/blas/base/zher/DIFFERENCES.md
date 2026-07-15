# zher: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — Four-wide register-blocked Hermitian rank-1 update

The reference (BLAS 3.12.0 `zher.f`) walks one column of `A` at a time,
updating the stored triangle with `A[i,j] += x[i] * (alpha*conj(x[j]))`. Our
`base.js` selects whichever traversal walks `A`'s smaller-stride dimension in
the inner loop and register-blocks the other dimension four wide, so a single
pass over the vector operand feeds four output streams. Only the stored
triangle is read or written; the reference `x[j] !== 0` column guard is
preserved.

Because `alpha` is real, the hoisted per-column temporary is the cheap
`temp = alpha*conj(x[j])`, and each element update is the fused
`x[i]*temp` — real part `xr*tr - xi*ti`, imaginary part `xr*ti + xi*tr` —
exactly as the reference computes it.

- **Real diagonal preserved.** The Hermitian diagonal is real by
  construction: the reference stores `DBLE(...)` in the real part and writes
  the imaginary part to `0.0` **unconditionally** — including for a zero
  column, where it zeroes the diagonal imaginary part and does nothing else.
  The blocked kernel reproduces this exactly: every stored diagonal has its
  imaginary part written to `0.0`, and its real part receives the reference
  update only when the column pivot is nonzero. This is the top correctness
  risk (a generic complex rank-1 update leaves diagonal imaginary garbage in
  place); it is covered directly by the gate, which initializes `A`'s stored
  diagonal with nonzero garbage imaginary parts.

- **Verification tier**: **bit-identical** (see `docs/optimization-policy.md`).
  The kernel only reschedules memory — each `A[i,j]` receives a single
  reference-order fused update, and no summation is reordered (JS `+`/`*` are
  single IEEE-754 ops) — so it is held to the strict tier rather than a
  tolerance. Gated against the preserved reference kernel with `Object.is`
  over the **FULL interleaved storage** of `A` (which also proves no element
  outside the reference's write set is touched) over 2880 cases spanning
  col/row/general/negative-stride layouts, vector strides in `{1, 2, -1}`,
  sizes `0..100`, garbage diagonal imaginary parts, zero-guard columns, and
  real-alpha specials `{0, 1, 0.7, -0.2}` (`bench/zher-opt/check.mjs`).

- **Measured**: ~1.5–1.8x (median ~1.57x) at `n` in `{100, 500, 2000}`, both
  layouts and both triangles; no case below 1.42x. This is a memory-bound
  Hermitian rank-1 update `A += alpha*x*x^H` (one read plus one write of the
  stored triangle per complex element), and the kernel moves `A` at ~28–34
  GB/s against the ~40 GB/s streaming ceiling on the reference machine, so it
  is near the bandwidth limit (`bench/zher-opt/bench.mjs`).

- **Oracle preserved**: `bench/zher-opt/variants/v0-reference.js`.
