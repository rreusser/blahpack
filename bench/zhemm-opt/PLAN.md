# zhemm optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zhemm` — Hermitian matrix-matrix multiply (`C = alpha*A*B +
beta*C` with A Hermitian on either side, one triangle stored). Complex analog
of `dsymm`, which shipped 4.4–14.6x via row packing + 4x4 tiling
(`bench/dsymm-opt/`) — but do not expect ratios anywhere near that here.

## Measured signal

Exploratory probe session (2026-07-15): complex level-3 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.3–1.9x hypothesized headroom**. Baseline
needs re-establishing in-tree.

## Most promising avenue

Follow the zgemm study's outcome (see `bench/zgemm-opt/PLAN.md` for the
shared register-pressure analysis — a 4x4 complex tile is 32 doubles,
categorically over V8's ~16-f64 spill budget; 2x2 is the safe geometry).
zhemm adds the dsymm complication on top:

- The Hermitian operand's `A[i,l]` lives at `(i,l)` or at `(l,i)`
  *conjugated*, depending on the stored triangle. dsymm solved the analogous
  problem with a module-level packing scratch buffer that materializes each
  row; the complex version packs conjugates as needed. This makes zhemm a
  natural *second* study after zgemm settles tile geometry and packing
  strategy.
- Diagonal elements: only the real part is referenced (`DBLE(A(j,j))`).
  Packing must zero/ignore stored imaginary parts on the diagonal.

## Open questions

- Whether the packed-panel approach clears the 1.5x ship bar at complex flop
  density — dsymm's giant ratios came from rescuing a pathologically slow
  reference access pattern, which the complex reference may not share to the
  same degree.
- Scratch sizing: dsymm used an 8 KiB buffer; complex doubles the bytes per
  element.

## Suggested investigation steps

1. Wait for (or run concurrently with) `bench/zgemm-opt/` to fix tile
   geometry and the packing question.
2. Reproduce the baseline; both `side` values, both triangles.
3. Copy `bench/dsymm-opt/` harness; v0 = shipped kernel, verbatim; gate over
   FULL C storage with garbage imaginary parts on the stored diagonal.

## References

- `bench/zgemm-opt/PLAN.md` — shared level-3 constraints; do that first.
- `bench/dsymm-opt/` — packing precedent.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
