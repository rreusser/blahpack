# ztrsm: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — blocked substitution with a 2x2 complex update tile

The reference (BLAS 3.12.0 `ztrsm.f`) solves `op(A)*X = alpha*B` /
`X*op(A) = alpha*B` in place with column-at-a-time complex substitution,
applying the rank update as a sequence of complex AXPYs. Our `base.js` folds
all twelve `(side, uplo, transa)` structural combinations into a single
upper-triangular backward substitution via effective strides plus a
conjugation sign `cs`:

- `side='right'` transposes the whole problem
  (`X*op(A) = alpha*B` ⇔ `op(A)^T*X^T = alpha*B^T`);
- `transa` swaps A's strides, and `transa='conjugate-transpose'` sets `cs=-1`
  so A is read conjugated (the effective operator is `A**H` on the left or
  `conj(A)` on the right);
- an effectively lower-triangular system is index-reversed into an upper one
  by negating strides and shifting offsets.

Rows are solved in 2-row blocks from the bottom up; for each block and each
pair of columns of B the update sum over already-solved rows is accumulated
gemm-style in complex registers (a 2x2 complex tile = 8 accumulator doubles,
under V8's ~16-f64 spill budget — a 4x4 complex tile would be 32 doubles and
spill), then the 2x2 triangular corner is solved in reference order (bottom
row first). This mirrors the shipped real `dtrsm` optimization; the sequential
corner solves are left scalar, which is the structural cap on the achievable
speedup.

- **Verification tier**: backward error (the blocked update reorders the
  summation; see `docs/optimization-policy.md`). Gated elementwise over the
  full B storage against the preserved reference kernel at relative tolerance
  `1e-12 * max(4, M, N)` across 14 496 cases in `bench/ztrsm-opt/check.mjs`,
  spanning all `side` × `uplo` × `transa ∈ {N, T, C}` × `diag` combinations,
  complex `alpha ∈ {0, 1, general}`, col/row/general/negative strides and
  offsets for both A and B, and M/N spanning the tile remainders
  (0, 1, 2, 3, 4, 5, 7, 8, 17, 64).
- **Corner complex-division faithfulness**: the corner divisions use the
  reference's Smith-formula complex division (identical to `cmplx.divAt`). For
  `side='left'` the corner divides the solved value by the diagonal directly,
  exactly as the reference does; for `side='right'` it multiplies by the
  reciprocal `1/A(j,j)` (computed once per diagonal via the same Smith
  formula), exactly as the reference does for that orientation. No division is
  rewritten as a reciprocal multiply, and no reciprocal multiply is rewritten
  as a division — each orientation keeps the reference's own corner form. The
  only per-element rounding change is the reordering of the update summation
  (the backward-error tier).
- **Exact special paths**: the `alpha == 0` early-out zeros B with the
  reference's loop and is bit-exact; the unit diagonal is never read when
  `diag='unit'` (the diagonal is NaN-poisoned in the gate to prove it); only
  the stored triangle of A is read and A is never written (bit-compared
  before/after in the gate).
- **Speedup**: ~1.2–4.0x across combos (≈5–6.3 GF/s vs the reference's
  ≈3.5–4.4 GF/s), at or above the shipped `zgemm` roofline; measured in
  `bench/ztrsm-opt/bench.mjs`. Best on col-major left/no-transpose and
  row-major left (up to ~4x at n=512); smallest on the right-side cases whose
  reference baseline was already fastest.
- **Oracle preserved**: `bench/ztrsm-opt/variants/v0-reference.js`.
