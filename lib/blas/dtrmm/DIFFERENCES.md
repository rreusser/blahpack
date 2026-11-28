
---

## [OPTIMIZATION] base.js -- 4x4 register-tiled in-place triangular multiply

The reference (BLAS 3.12.0 `dtrmm.f`) updates `B` with scalar rank-1 sweeps.
Our `base.js` caches the 4x4 diagonal corner of `B` in registers before
overwriting it, then splits each block's K-loop into that scalar triangular
corner (honoring `diag`) plus a dense dgemm-style 4x4 register tile for the
uniform part. Effective strides fold the `(side, uplo, transa)` cases
together, so one kernel covers all 16 combinations in both storage layouts.
The reference's `if (b !== 0.0)` skip-guards are dropped inside the tiled
loops (dgemm precedent). Tiles are processed in an order that preserves the
reference's in-place dataflow: every `B` value is read before it is
overwritten. `diag = 'unit'` never reads A's diagonal; A is never written.

- **Verification tier**: backward error (the tiles reorder summation; see
  `docs/optimization-policy.md`). Gated against the preserved reference
  kernel elementwise over the full `B` storage, plus a bit-identity check
  that `A` is never modified, over 26496 cases spanning all 16
  `side x uplo x transa x diag` combos, col/row/general strides for `A` and
  `B`, and sizes 0..33 with `M != N` (`bench/dtrmm-opt/check.mjs`).
- **Measured**: 4.7-6.3x col-major and up to 13.5x row-major at
  `n` in {128, 256, 512}; reaches the shipped register-tiled dgemm roofline
  (8.1 vs 8.0 GF/s at n=512) (`bench/dtrmm-opt/bench.mjs`).
- **Oracle preserved**: `bench/dtrmm-opt/variants/v0-reference.js`.
