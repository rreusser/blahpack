# Complex level-3 tile geometry — settled

**Flagship finding for the complex BLAS level-3 family** (zgemm, and reused by
zhemm / zherk / zher2k / ztrmm / ztrsm). Measured in-tree, 2026-07-15, Node
v24, `bench/zgemm-opt/{gen-tile.cjs,check.mjs,bench.mjs}`.

## Verdict: **2x2 complex register tile.**

A complex accumulator is **two doubles** (re, im). V8 spills accumulators past
~16 live f64 (the dgemm-opt measurement). So the real-family 4x4 tile — 32
accumulator doubles — is categorically over budget, and the geometry question
is entirely different from the real case. The sweep confirms the register model
cleanly:

| tile      | acc doubles | +operands | geomean speedup | note                         |
|-----------|-------------|-----------|-----------------|------------------------------|
| **2x2**   | **8**       | +8        | **1.63x**       | **winner — fits, max reuse** |
| 4x2 / 2x4 | 16          | +12       | 1.55x           | at spill threshold           |
| 3x2 / 2x3 | 12          | +10       | 1.48x           | mild spill                   |
| 1x4 / 4x1 | 8           | +10       | 1.46x           | fits, but half the reuse     |
| pack-2x2  | 8           | +8        | 1.08x           | packing overhead not repaid  |

Speedup is **consistent 1.5–1.7x across all 9 op combos** (NN/CN/NC/CC/TN/…)
and all sizes swept (N = 8 … 256); it does not depend on hitting a best case.
Baseline (`v0-reference`) runs ~3.8–5.4 GF/s; the 2x2 tile runs ~6.3–8.6 GF/s.

## Why 2x2 and not wider

The win is the same as dgemm's: accumulate each C(i,j) in registers across the
whole K loop so C is touched once and every A/B load is reused across the tile.
For complex, reuse trades directly against the 2-doubles-per-accumulator budget:

- **2x2** loads 2 A + 2 B complex elements per k and does 4 complex MACs — reuse
  factor 2, using only 8 accumulator doubles. It fits with room for operands, so
  the inner loop stays register-resident. This is the sweet spot.
- **4x2 / 2x4** double the accumulators to 16 doubles. That alone sits at the
  spill line, and once the ~12 operand doubles are added the inner loop spills —
  it lands *below* 2x2 despite more theoretical reuse. The wider real tiles win
  because a real accumulator is one double; the complex penalty removes that
  headroom.
- **1x4 / 4x1** fit (8 acc doubles) but give reuse factor 1 in one dimension, so
  they trail 2x2.

## Why packing lost

`pack-2x2` deinterleaves the A/B panels into split re/im unit-stride scratch
(dsymm-style module buffers), folding transpose+conjugation in once. It is
correct and branch-free in the hot loop, but only ~1.08x: complex level-3 is
compute-bound (≈4x the flops/byte of real gemm), so it was never gather-starved
the way the real family was, and the extra packing pass isn't repaid. Packing is
**not** the lever here — tile geometry is. (Packing may still matter for the
symmetric/triangular followers where the operand must be *materialized* from a
stored triangle regardless — but as a pure speed lever on dense zgemm it does
not pay.)

## Recommendation for the follower routines

Reuse the **2x2 complex register tile with a single general-stride +
conj-sign-flag code path** (see `variants/gen-2x2.js` / the shipped
`lib/blas/base/zgemm/lib/base.js`):

- Conjugation folds into a hoisted `csa`/`csb = ±1` multiplier on the imaginary
  lane — never a per-element branch, never a separate mode kernel.
- Transpose folds into effective row/col strides (`ar/ak/bk/bn`), so one kernel
  covers all mode combinations.
- Faithful 4-mul / 2-add complex product only (no Gauss/Karatsuba — that changes
  per-element rounding and is off-policy).
- Do **not** reach for 4x4 or packing on the complex side; both lose here.

Followers that must build one operand from structure (zhemm's symmetric side,
the zher* triangles) should still pack *that operand* for correctness, but keep
the 2x2 accumulator geometry for the multiply itself.
