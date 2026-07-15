# zher2 optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zher2` — Hermitian rank-2 update
(`A += alpha*x*y^H + conj(alpha)*y*x^H`, one triangle stored). Complex analog
of `dsyr2` (shipped 1.7–2.6x from `bench/dsyr2-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): complex level-2 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.5–2x hypothesized headroom**. Rank-2 has
twice the arithmetic per element of rank-1, so it is even less memory-starved
than zher; expect the low end. Baseline needs re-establishing in-tree.

## Most promising avenue

The `bench/dsyr2-opt/` pattern: 4-wide blocking with both per-column
temporaries hoisted — here `alpha*conj(y[j])` and `conj(alpha)*conj(x[j])`
(4 complex temps = 8 doubles per block column; watch register pressure with
the accumulators, but it should fit under the ~16-f64 spill threshold).
Complex-specific points:

- The diagonal receives `alpha*x[j]*conj(y[j]) + conj(alpha)*y[j]*conj(x[j])`
  which is real by construction; the reference stores only the real part.
  Reproduce exactly.
- Each `A[i,j]` gets one fused two-term update — the two-term sum has a fixed
  evaluation order in the reference; preserving it should again allow the
  bit-identical gate tier. Verify.

## Open questions

- Is the headroom at this flop density still above the 1.5x ship bar? If a
  first prototype lands below it, stop early — that's the survey verdict, not
  a failure.
- Shared infrastructure with `bench/zher-opt/` — the harnesses will be nearly
  identical; consider building zher first and cloning.

## Suggested investigation steps

1. Reproduce the baseline.
2. Copy `bench/dsyr2-opt/` harness; v0 = shipped kernel, verbatim.
3. Gate: FULL-storage elementwise, bit-identical tier if it holds, garbage
   diagonal imaginary parts, both triangles, strided x/y.

## References

- `bench/dsyr2-opt/` — the direct template.
- `bench/zher-opt/PLAN.md` — sibling study; do that one first.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
