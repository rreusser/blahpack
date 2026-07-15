# ztrmm optimization plan

**Status: plan only.** No optimization work has been started. This document
sketches the most promising avenue so the study can be picked up and acted
on; it is a starting point for investigation, not committed intent.

## Routine

`lib/blas/base/ztrmm` — triangular matrix-matrix multiply (`B = alpha*op(A)*B`
or `B = alpha*B*op(A)`, A triangular, op in {N, T, C}). Complex analog of
`dtrmm` (shipped 4.7–13.5x from 4x4 register tiling, `bench/dtrmm-opt/`).

## Measured signal

Exploratory probe session (2026-07-15): ztrmm/ztrsm were the *softest* of the
complex level-3 kernels at **~4 GF/s** against a ~9.4 GF/s roofline —
**~2x+ hypothesized headroom**, the best ratio in the complex level-3 family.
If only one complex level-3 study goes forward, the measurements say it
should be this one (with ztrsm). Baseline needs re-establishing in-tree.

## Most promising avenue

The `bench/dtrmm-opt/` pattern — register-tiled triangular multiply with the
triangle handled as a rectangular bulk plus ragged edge — at the complex tile
geometry the zgemm study settles on (`bench/zgemm-opt/PLAN.md`: 2x2 complex
is the safe start; 4x4 is 32 accumulator doubles, over V8's spill budget).

ztrmm-specific points:

- op = C (conjugate transpose) is a third mode dtrmm didn't have; fold
  conjugation into the packed panel or a hoisted sign, not a per-element
  branch.
- unit vs non-unit diagonal: same edge cases as dtrmm.
- In-place semantics (B is both input and output): tile scheduling must
  respect the reference's traversal direction so untouched-yet rows/columns
  of B are read before being overwritten. dtrmm solved this; port the
  ordering logic, don't reinvent it.

## Open questions

- Why is the ztrmm baseline (~4 GF/s) notably below its zgemm cousin
  (~5–7 GF/s)? If it's the skip-guard/branchy inner loop rather than memory
  behavior, tiling may recover more than the ratio suggests.
- Benchmark trap (measured in the d-campaign): repeated in-place calls
  underflow B toward zero and skip-guards then fake huge GF/s. Use a
  near-identity triangular A and assert B stays finite/nonzero.

## Suggested investigation steps

1. Reproduce the baseline across side/uplo/trans/diag.
2. Copy the `bench/dtrmm-opt/` harness (it already avoids the underflow
   trap); v0 = shipped kernel, verbatim.
3. Start with the workload-common modes; gate rtol tier per policy over FULL
   B storage.

## References

- `bench/dtrmm-opt/` — the direct template.
- `bench/zgemm-opt/PLAN.md` — shared tile-geometry constraints.
- `docs/complex-numbers.md`, `docs/optimization-policy.md`.
