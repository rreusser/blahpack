# dsymm: Differences from the Reference

Deviations of our translation (`lib/blas/base/dsymm/`) from the BLAS 3.12.0
reference implementation (`dsymm.f`).

---

## [OPTIMIZATION] base.js -- Row-packed 4x4 register-tiled kernel

The reference computes `C` with scalar loops that read the symmetric operand
`A` from whichever side of the diagonal holds the stored triangle -- an access
pattern that cannot be tiled directly, because `A[i,l]` lives at `(i,l)` or
`(l,i)` depending on the side.

Our `base.js` **packs** four rows of the symmetric operand at a time into a
small contiguous scratch buffer, materializing the mirrored entries once, and
then runs a dgemm-style 4x4 register-tiled K-loop against the packed rows.
Packing is O(4K) amortized over the columns of `C`, so it is negligible. Edge
columns use a 4x1 kernel and the row remainder falls back to scalar code. The
K loop is cache-blocked at `KC = 256` (matching `lib/blas/base/dgemm`), with
`beta` applied only on the first K-panel. Effective strides make the kernel
layout-agnostic and cover both `side` and both `uplo` values.

- **Packing buffer**: a module-level `Float64Array( 4 * KC )` (8 KiB) reused
  across calls rather than allocated per call. This is safe because the
  kernel never calls out or yields while the buffer is live (JavaScript is
  single-threaded and the packing/consuming code is straight-line).
- **Verification tier**: backward error (the tiles reorder summation; see
  `docs/optimization-policy.md`). Gated against the preserved reference
  kernel elementwise over the full `C` storage, plus a bit-identity check
  that `A` and `B` are never written, over 12100 cases spanning all four
  `side x uplo` combos, col/row/general strides for `A`, `B`, and `C`, sizes
  0..33 with `M != N`, and alpha/beta specials (`bench/dsymm-opt/check.mjs`).
- **Measured**: 4.4-6.8x col-major and 4.8-14.6x row-major at `n` in
  {128, 256, 512}; reaches the shipped register-tiled dgemm roofline
  (8.5-8.6 vs 8.2-8.9 GF/s) (`bench/dsymm-opt/bench.mjs`).
- **Oracle preserved**: `bench/dsymm-opt/variants/v0-reference.js`.

The reference's `if (b !== 0.0)` skip-guards are dropped inside the tiled
loops (dgemm precedent). Only the stored triangle of `A` is ever read.
