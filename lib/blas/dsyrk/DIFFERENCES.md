# dsyrk: Differences from the Reference

Deviations of our translation (`lib/blas/base/dsyrk/`) from the BLAS 3.12.0
reference implementation (`dsyrk.f`).

---

## [OPTIMIZATION] base.js -- 4x4 register-tiled triangular kernel

The reference computes the stored triangle of `C` with rank-1 column updates
(no-transpose) or scalar dot products (transpose). Our `base.js` applies beta
to the stored triangle first (reference order), then accumulates
`alpha*op(A)*op(A)^T` with dgemm-style 4x4 register tiles: full tiles that lie
entirely within the triangle use the 16-accumulator K-loop; the
diagonal-straddling fringe and row/column remainders use reference-style
scalar loops with exact triangle bounds. Effective strides (`ar`, `ak`)
derived from the transpose flag cover both trans modes and both storage
layouts with a single kernel. The reference's `if (a !== 0.0)` skip-guards are
dropped inside the tiled loops (dgemm precedent). The opposite triangle of `C`
is never read or written.

- **Verification tier**: backward error (the tiles reorder summation; see
  `docs/optimization-policy.md`). Gated against the preserved reference
  kernel elementwise over the FULL `C` storage (which also proves the
  opposite triangle is untouched) at rel. tol. `1e-14 * max(4, K)` over
  21780 cases spanning uplo/trans, col/row/general strides for `A` and `C`
  independently, sizes 0..33 with `N != K`, and alpha/beta specials
  (`bench/dsyrk-opt/check.mjs`).
- **Measured**: 2.6-5.4x for col-major and row-major transpose modes,
  11-19x for row-major no-transpose (which has poor cache behavior in the
  reference kernel), at `n = k` in {128, 256, 512}; within ~10% of the
  shipped register-tiled dgemm roofline at `n = 512`
  (`bench/dsyrk-opt/bench.mjs`).
- **Oracle preserved**: `bench/dsyrk-opt/variants/v0-reference.js`.
