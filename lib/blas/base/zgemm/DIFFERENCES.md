# zgemm: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — 2x2 complex register-tiled kernel

The reference (BLAS 3.12.0 `zgemm.f`) computes each of the nine op combinations
(`op(A)`, `op(B)` in {N, T, C}) with a separate hand-written loop nest — an
axpy form for the `no-transpose`/`no-transpose` products and a scalar
dot-product form for the transposed variants. Our `base.js` replaces all nine
with a **single general-stride 2x2 complex register-tiled kernel**:

- Each 2x2 block of `C` is accumulated in four complex registers (eight
  doubles) across the entire `K` loop, so `C` is touched once and every `A`/`B`
  load is reused across the tile.
- The transpose is folded into effective row/column strides (`ar`, `ak`, `bk`,
  `bn`); conjugation is folded into a hoisted `+/-1` sign multiplier on the
  imaginary lane (`csa`, `csb`) — never a per-element branch or a separate
  kernel. One code path therefore realizes all nine modes.
- The complex product keeps the faithful **four-multiply / two-add** form. No
  Gauss/Karatsuba three-multiply trick: that changes per-element rounding
  (not merely summation order) and is off-policy.
- Row/column remainders (`M % 2`, `N % 2`) fall to scalar complex-dot cleanup
  loops. The `alpha = 0` and empty-dimension quick returns match the reference.

- **Verification tier**: backward error (the tile reorders the `K`-summation;
  see `docs/optimization-policy.md`). Gated against the preserved reference
  kernel at a K-scaled relative tolerance (`2e-15 * (K+4)`) over the FULL `C`
  storage — 19 656 cases spanning all nine op combos, complex alpha/beta in
  {0, 1, general}, col/row/negative-stride layouts and padded/offset views for
  A/B/C, and non-square shapes with K crossing the tile remainder
  (`bench/zgemm-opt/check.mjs`, worst observed rel. err. ~4.9e-14).
- **Speedup**: consistent ~1.5–1.7x across every op combo and size 8–256
  (geomean ~1.63x); baseline ~3.8–5.4 GF/s, tiled ~6.3–8.6 GF/s
  (`bench/zgemm-opt/bench.mjs`).
- **Geometry**: the 2x2 tile was settled empirically against 4x2/2x4/3x2/2x3/
  1x4/4x1 tiles and a split re/im packing variant; 2x2 is the register-budget
  sweet spot for complex accumulators (two doubles each) — see
  `bench/zgemm-opt/GEOMETRY.md`, the flagship geometry finding reused by the
  complex level-3 family (zhemm/zherk/zher2k/ztrmm/ztrsm).
- **Oracle preserved**: `bench/zgemm-opt/variants/v0-reference.js`.
