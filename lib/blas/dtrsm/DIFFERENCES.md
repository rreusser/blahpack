
---

## [OPTIMIZATION] base.js -- Blocked substitution with 4x4 register tiles

The reference (BLAS 3.12.0 `dtrsm.f`) solves one unknown at a time with
scalar sweeps. Our `base.js` performs **block substitution**: for each 4-row
block it accumulates the update from already-solved blocks with a dgemm-style
4x4 register tile K-loop, then solves the 4x4 triangular diagonal corner with
scalar code in reference order -- dividing by the diagonal exactly as the
reference does (never reciprocal-multiplying, which would change the
rounding). This is the same recurrence with the updates re-associated, not a
different solve method. Effective strides fold the `(side, uplo, transa)`
cases together. `diag = 'unit'` never reads A's diagonal; A is never written.

- **Verification tier**: backward error (the tiled updates reorder summation;
  see `docs/optimization-policy.md`). Gated against the preserved reference
  kernel elementwise over the full `B` storage, plus a bit-identity check
  that `A` is never modified, over 11680 cases spanning all 16
  `side x uplo x transa x diag` combos, col/row/general strides for `A` and
  `B`, and sizes 0..33 with `M != N`, using well-conditioned triangular `A`
  (`bench/dtrsm-opt/check.mjs`).
- **Measured**: 3.1-5.5x col-major and up to 9.9x row-major at
  `n` in {128, 256, 512} (`bench/dtrsm-opt/bench.mjs`). Sits below the dgemm
  roofline (5.2-5.4 vs 8.2 GF/s) because the sequential corner solves cannot
  be tiled; the tiled rectangle updates are what carry the win.
- **Oracle preserved**: `bench/dtrsm-opt/variants/v0-reference.js`.
