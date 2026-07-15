# zher2k optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zher2k` — Hermitian rank-2k update
(`C = alpha*A*B^H + conj(alpha)*B*A^H + beta*C`, beta REAL, one triangle of C
updated). Complex analog of `dsyr2k` (shipped 2.1–9.3x from 4x4 tiling,
`bench/dsyr2k-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): complex level-3 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.3–1.9x hypothesized headroom**. Baseline
needs re-establishing in-tree.

## Most promising avenue

Same family as zherk: triangle-restricted register tiling at the geometry the
zgemm study settles on (`bench/zgemm-opt/PLAN.md` — 2x2 complex is the safe
start; 4x4 is over the spill budget). The rank-2k structure doubles the
accumulation terms per tile, which *tightens* register pressure further —
this is likely the most register-constrained kernel in the family, so it
should come last, cloned from a settled zherk study.

Specific points:

- Complex alpha but REAL beta; the two product terms are conjugate
  transposes of each other, so a fused tile computes both from one pass over
  packed A/B panels.
- Diagonal of C is real by construction (`DBLE(...)` in the reference) —
  same exact-semantics requirement as zherk.

## Open questions

- Whether a fused two-term 2x2 tile fits the spill budget at all, or the two
  terms need separate passes (halving reuse and probably the win).
- Whether measured headroom at this flop density survives above the 1.5x
  ship bar — a below-bar prototype is a legitimate "skip" verdict.

## Suggested investigation steps

1. Do `bench/zherk-opt/` first; clone its settled harness and tile.
2. Reproduce the baseline for both `uplo`/`trans` combinations.
3. Gate: FULL C storage, real-diagonal exactness with garbage imaginary
   inputs, rtol tier per `docs/optimization-policy.md`.

## References

- `bench/zherk-opt/PLAN.md`, `bench/zgemm-opt/PLAN.md` — upstream studies.
- `bench/dsyr2k-opt/` — the direct real-arithmetic template.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
