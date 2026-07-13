# dsyr2k: Differences from the Reference

Deviations of our translation (`lib/blas/base/dsyr2k/`) from the BLAS 3.12.0
reference implementation (`dsyr2k.f`).

---

## [OPTIMIZATION] base.js -- 4x4 register-tiled triangular kernel

The reference computes the stored triangle of `C` with rank-2 column updates
(no-transpose) or paired scalar dot products (transpose). Our `base.js` applies
beta to the stored triangle first (reference order), then accumulates the two
rank-k products in **two sequential tiled passes** over the triangle:
`C += alpha*op(A)*op(B)^T`, then `C += alpha*op(B)*op(A)^T`. The second pass is
the first with `A` and `B` swapped, so a single private helper (`tiled`)
parameterized by the two matrices' effective strides serves both. Each pass
uses dgemm-style 4x4 register tiles: full tiles that lie entirely within the
triangle use the 16-accumulator K-loop; the diagonal-straddling fringe and
row/column remainders use reference-style scalar loops with exact triangle
bounds. Effective strides (`ar`, `ak`) and (`br`, `bk`) derived from the
transpose flag cover both trans modes and both storage layouts with a single
kernel. The reference's `if (a !== 0.0 || b !== 0.0)` skip-guards are dropped
inside the tiled loops (dgemm/dsyrk precedent). The opposite triangle of `C` is
never read or written, and `A` and `B` are never written.

The two products are deliberately **not** fused into a single tile pass: that
would require 32 accumulators, which spills past V8's ~16 f64 registers (proven
in `bench/dgemm-opt/`).

- **Verification tier**: backward error (the tiles reorder summation, and the
  two products are summed in sequence rather than pairwise per `l`; see
  `docs/optimization-policy.md`). Gated against the preserved reference kernel
  elementwise over the FULL `C` storage (which also proves the opposite
  triangle is untouched) at rel. tol. `1e-14 * max(4, K)` over 65340 cases
  spanning uplo/trans, col/row/general strides for `A`, `B`, and `C`
  independently, sizes 0..33 with `N != K`, and alpha/beta specials; `A` and
  `B` are additionally bit-compared before/after to prove they are never
  written (`bench/dsyr2k-opt/check.mjs`).
- **Measured**: 2.2-2.5x for col-major no-transpose, 4.2-4.4x for transpose
  modes, and 6.6-9.4x for row-major no-transpose (which has poor cache behavior
  in the reference kernel), at `n = k` in {256, 512}; 2.1-4.2x at `n = k = 128`.
  The optimized kernel reaches 7.2-8.4 GF/s against a 8.1-8.9 GF/s shipped
  register-tiled dgemm roofline on the same sizes (`bench/dsyr2k-opt/bench.mjs`).
- **Oracle preserved**: `bench/dsyr2k-opt/variants/v0-reference.js`.
