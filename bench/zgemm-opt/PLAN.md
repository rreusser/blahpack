# zgemm optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent. This is
the flagship plan for the complex level-3 family — the register-pressure
analysis here is shared by zhemm/zherk/zher2k/ztrmm/ztrsm.

## Routine

`lib/blas/base/zgemm` — complex general matrix multiply. High-leverage:
underlies dozens of complex LAPACK drivers (zpotrf, zgetrf, zhetrd, the
zlaqr*/Schur path). But the measured headroom is modest and the technical
constraints are real — treat this as a speculative study, not a straight
port of the dgemm work.

## Measured signal

Exploratory probe session (2026-07-15): complex level-3 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.3–1.9x hypothesized headroom**. Compare
the real level-3 family, which sat at 0.5–2 GF/s (4–17x headroom) before
tiling: complex arithmetic does ~4x the flops per byte, so these kernels were
never memory-starved the way their real cousins were. Baseline needs
re-establishing in-tree.

## The register-pressure constraint (key finding, do not skip)

The dgemm study (`bench/dgemm-opt/`) measured that V8 spills accumulators
past roughly 16 live f64 values, and that spilling erases the tiling win. A
4x4 *complex* accumulator tile is 32 doubles — categorically over budget.
Viable geometries to investigate:

- **2x2 complex tile** = 4 complex accumulators = 8 doubles, plus loaded
  operands (~4–8 more). Should fit; reuse factor is half of 4x4.
- **Rectangular tiles** (4x2, 2x4 = 16 doubles of accumulator) — probably
  marginal; `bench/dgemm-opt/gen-tile.js` can be extended to generate complex
  tiles and sweep geometry empirically rather than argue from theory.
- **3-multiply (Gauss/Karatsuba) complex product** — cuts multiplies 25% but
  changes per-element *rounding*, not merely summation order. That is likely
  outside `docs/optimization-policy.md`'s reordering allowance; treat as
  off-policy unless explicitly revisited.

## Open questions

- Does a 2x2 tile's ~1.5x-ish ceiling clear the 1.5x ship bar consistently
  across transpose modes and layouts, or only in the best case?
- Conjugate-transpose modes: zgemm has op in {N, T, C} for both operands —
  9 mode combinations vs dgemm's 4. Can conjugation fold into the stride
  logic as a sign flag without per-element branching?
- Is split re/im scratch packing (deinterleave A/B panels into separate
  re/im buffers, dsymm-style 8 KiB module scratch) a bigger lever than tile
  geometry? It halves the accumulator problem and may enable 4x4-real-style
  inner loops.

## Suggested investigation steps

1. Reproduce the baseline; extend `bench/bench-opt-candidates.mjs` or build a
   dir-local probe with the dgemm-opt min-of-trials harness.
2. Extend `bench/dgemm-opt/gen-tile.js` to emit complex tiles; sweep 2x2,
   4x2, 2x4 empirically.
3. Prototype split re/im packing as an independent variant before combining.
4. Gate per `docs/optimization-policy.md` (rtol tier — tiling reorders sums);
   remember the benchmark trap from the d-campaign: avoid in-place repeated
   calls that underflow operands to zero.

## References

- `bench/dgemm-opt/` — harness, gen-tile.js, spill-threshold measurements,
  full report under `reports/`.
- `bench/dsymm-opt/` — the packing precedent.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`,
  `docs/performance-patterns.md`.
