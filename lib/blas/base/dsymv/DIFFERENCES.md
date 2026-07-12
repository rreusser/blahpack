# dsymv: Differences from Reference

Deviations of our translation (`lib/blas/base/dsymv/`) from a direct
rendering of the BLAS 3.12.0 reference (`dsymv.f`).

---

## [OPTIMIZATION] base.js -- Symmetry-normalized four-wide register blocking

The reference (BLAS 3.12.0 `dsymv.f`) has separate upper/lower column loops
whose inner stride is whatever the storage order dictates. Our `base.js`
exploits symmetry — reading the stored triangle with strides `(sa1, sa2)`
as the opposite triangle with strides `(sa2, sa1)` visits the same stored
elements with the same values — to pick, for either `uplo` and either
storage order, the triangle orientation whose inner (row) stride is the
smaller. It then blocks four columns per pass: a fused four-column sweep
over the rectangular part of the triangle (four register accumulators for
the dot parts, one fused four-term update for the axpy parts), reference-
style scalar code for the 4x4 diagonal corner, and a scalar remainder for
the trailing `N % 4` columns. Only the stored triangle is ever read.

- **Verification tier**: backward error (the blocked passes reorder
  summation; see `docs/optimization-policy.md`). Gated against the
  preserved reference kernel elementwise at rel. tol. `1e-14 * max(4, N)`
  over 2640 cases spanning both `uplo` values, col-/row-major/general/
  negative-stride layouts, positive/negative/non-unit `x`/`y` strides,
  remainder sizes (N = 0..64), and alpha/beta specials
  (`bench/dsymv-opt/check.mjs`).
- **Measured**: 2.3-2.4x at n=500 and n=2000 col-major, 2.3-2.7x
  row-major, both `uplo` values (`bench/dsymv-opt/bench.mjs`, interleaved
  min-of-trials).
- **Oracle preserved**: `bench/dsymv-opt/variants/v0-reference.js`.
