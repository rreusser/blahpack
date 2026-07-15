# zher optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zher` — Hermitian rank-1 update (`A += alpha*x*x^H`, alpha
real, one triangle stored). Complex analog of `dsyr` (shipped 1.7–2.6x,
bit-identical, from `bench/dsyr-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): complex level-2 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.5–2x hypothesized headroom**, likely the
lower end since the kernel is less memory-starved than dsyr was. Baseline
needs re-establishing in-tree.

## Most promising avenue

The `bench/dsyr-opt/` pattern: 4-wide blocked rank update restricted to the
stored triangle, with the per-column temporary `alpha*conj(x[j])` hoisted.
Complex-specific points to investigate:

- alpha is REAL in zher — the update is `x[i] * (alpha*conj(x[j]))`, cheaper
  than a general complex-complex rank-1. Exploit it.
- The diagonal result is real by construction; the reference explicitly
  stores `DBLE(...)` and zeroes the imaginary part. The blocked kernel must
  reproduce this exactly — easy to break with a generic update, and a likely
  source of subtle gate failures.
- Like dger/dsyr, each `A[i,j]` receives exactly one fused update — the
  bit-identical gate tier should be achievable. Verify early.

## Open questions

- Triangle-edge handling: dsyr blocked the rectangular bulk 4-wide and
  handled the ragged triangle edge scalar; confirm the same split is worth it
  at complex flop density.
- Both triangles, both layouts: layout-adaptive stride folding per dsyr, with
  strides doubled for interleaving.

## Suggested investigation steps

1. Reproduce the baseline.
2. Copy the `bench/dsyr-opt/` harness; `variants/v0-reference.js` = shipped
   kernel, verbatim.
3. Gate: elementwise over FULL A storage (untouched triangle must never be
   written), bit-identical tier if it holds; adversarial cases include
   garbage imaginary parts on the stored diagonal.

## References

- `bench/dsyr-opt/` — the direct template.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
