# zhemv optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/zhemv` — Hermitian matrix-vector multiply
(`y = alpha*A*x + beta*y`, A Hermitian, one triangle stored). The complex
analog of `dsymv`, which shipped 2.3–2.9x from 4-wide register blocking.

## Measured signal

Exploratory probe session (2026-07-15): complex level-2 kernels run ~5–7 GF/s
against a ~9.4 GF/s roofline — **~1.5–2x hypothesized headroom**. Complex
arithmetic's higher flop/byte ratio means these were never as memory-starved
as the real family, so expect the smaller end of the range. Baseline needs
re-establishing in-tree.

## Most promising avenue

The `bench/dsymv-opt/` pattern: fused dot+axpy traversal of the stored
triangle with 4-wide blocking, so each loaded `A[i,l]` (and its implicit
conjugate mirror) is used for both the row contribution and the column
contribution. Complex-specific adaptations to investigate:

- The mirrored element is `conj(A[l,i])` — the fused traversal must apply
  conjugation on exactly one of the two uses. Sign-flip on the imaginary
  part, hoistable out of the inner loop.
- Diagonal elements are real by definition (reference uses only
  `DBLE(A(j,j))`); the blocked kernel must preserve that exact semantic —
  including when stored imaginary parts are nonzero garbage.
- 4 complex accumulators = 8 live doubles; register pressure should be fine
  (V8 spill threshold ~16 f64, measured in `bench/dgemm-opt/`).

## Open questions

- Does the fused-triangle blocking pay off as much when the kernel is closer
  to compute-bound than dsymv was?
- upper vs lower triangle: same dual-form treatment as dsymv, or does
  conjugation asymmetry favor one specialization?

## Suggested investigation steps

1. Reproduce the baseline (add to `bench/bench-opt-candidates.mjs` or a
   dir-local probe).
2. Copy the `bench/dsymv-opt/` harness; `variants/v0-reference.js` = shipped
   kernel, verbatim.
3. Check gate must cover: garbage imaginary parts on the diagonal, both
   triangles, strided/offset x and y, complex alpha/beta including 0 and 1.

## References

- `bench/dsymv-opt/` — the direct template.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`,
  `docs/performance-patterns.md`.
