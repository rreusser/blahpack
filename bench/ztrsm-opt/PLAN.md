# ztrsm optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/ztrsm` — triangular solve with multiple right-hand sides
(`op(A)*X = alpha*B` or `X*op(A) = alpha*B`, solved in place into B). Complex
analog of `dtrsm` (shipped 3.1–9.9x, `bench/dtrsm-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): ztrsm, with ztrmm, was the softest
complex level-3 kernel at **~4 GF/s** against a ~9.4 GF/s roofline —
**~2x+ hypothesized headroom**, the best ratio in the family. Baseline needs
re-establishing in-tree.

## Most promising avenue

The `bench/dtrsm-opt/` pattern: tile the rank-update (gemm-like) bulk of the
solve while leaving the sequential corner solves scalar — dtrsm capped at
~5.3 GF/s vs the ~8.5 roofline for exactly this reason, and the same
structural cap applies here. Complex tile geometry per
`bench/zgemm-opt/PLAN.md` (2x2 complex to stay under the V8 spill budget).

ztrsm-specific points:

- Complex division at the corner solves (non-unit diagonal): the reference
  divides by `A(j,j)` using straightforward complex division. Any "multiply
  by reciprocal" rewrite changes rounding — check what dtrsm was allowed to
  do under `docs/optimization-policy.md` and stay within it.
- op = C mode (conjugate transpose) on top of dtrsm's mode set.
- In-place update ordering matters even more than ztrmm since solved values
  feed later solves; port dtrsm's traversal logic.

## Open questions

- With the corner solves sequential and complex division expensive, how much
  of the ~2x headroom is actually reachable? dtrsm reached ~60% of its
  sibling kernels' ceiling; a similar fraction here still clears the 1.5x
  ship bar, but barely — measure early, decide at the prototype.
- Same underflow benchmark trap as ztrmm (repeated in-place solves): use
  near-identity A, assert B stays finite/nonzero.

## Suggested investigation steps

1. Reproduce the baseline across side/uplo/trans/diag.
2. Copy the `bench/dtrsm-opt/` harness; v0 = shipped kernel, verbatim.
3. Prototype the bulk-update tiling first (it dominates for large N-rhs);
   gate rtol tier per policy over FULL B storage, with exactness expectations
   for the untouched-alpha==1/unit-diag special paths preserved by the
   reference.

## References

- `bench/dtrsm-opt/` — the direct template (including its structural-cap
  analysis).
- `bench/zgemm-opt/PLAN.md` — shared tile-geometry constraints.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
