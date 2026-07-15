# zherk optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zherk` — Hermitian rank-k update (`C = alpha*A*A^H + beta*C`,
alpha and beta REAL, one triangle of C updated). Complex analog of `dsyrk`
(shipped 2.6–17.7x from 4x4 tiling, `bench/dsyrk-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): complex level-3 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.3–1.9x hypothesized headroom**. Baseline
needs re-establishing in-tree.

## Most promising avenue

Register tiling restricted to the stored triangle, at the tile geometry the
zgemm study settles on (see `bench/zgemm-opt/PLAN.md` — 4x4 complex is over
the V8 spill budget; 2x2 is the safe starting point). zherk-specific points:

- alpha/beta are real — the inner update is complex-complex but the scaling
  is cheap. The `A*A^H` structure means the two operands are the same array
  read with swapped/conjugated indexing; a packed panel can serve both.
- Diagonal entries of C are real by construction; the reference stores
  `DBLE(...)` on the diagonal and ignores stored imaginary parts there.
  Tiles that straddle the diagonal must reproduce this exactly — dsyrk
  handled the straddle with edge cases; the complex version adds the
  real-diagonal rule on top.

## Open questions

- Does triangle-restricted 2x2 tiling clear the 1.5x bar? dsyrk's biggest
  wins came from the transposed mode's terrible baseline access pattern —
  check whether the complex reference shares that weakness (op = C mode,
  i.e. `A^H*A`).
- Tile-diagonal interaction: scalar edge handling vs masked tile writes.

## Suggested investigation steps

1. Reproduce the baseline for both `uplo` and both op modes (N: `A*A^H`,
   C: `A^H*A`).
2. Copy the `bench/dsyrk-opt/` harness; v0 = shipped kernel, verbatim.
3. Gate over FULL C storage (untouched triangle never written), garbage
   imaginary parts on the diagonal, rtol tier per policy.

## References

- `bench/zgemm-opt/PLAN.md` — shared level-3 constraints; settle geometry
  there first.
- `bench/dsyrk-opt/` — the direct template.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
