# zherk: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — 2x2 complex register-tiled kernel over the stored triangle

The reference (BLAS 3.12.0 `zherk.f`) computes the Hermitian rank-k update
`C := alpha*A*A^H + beta*C` (trans=N) or `C := alpha*A^H*A + beta*C` (trans=C)
with a beta-scaling pass over one triangle followed by a scalar rank-1 /
dot-product accumulation. Our `base.js` accumulates each `C(i,j)` of the stored
triangle in registers across the whole K loop using a **2x2 complex register
tile** (8 accumulator doubles — the settled complex level-3 tile geometry; see
`bench/zgemm-opt/GEOMETRY.md`). C is touched once per output cell and every A
load is reused across the tile.

- **Single general-stride path**: both trans modes and both layouts collapse
  into one kernel via effective strides `(ar, ak)` derived from the transpose
  flag. Conjugation folds into a hoisted `±1` sign flag on the imaginary lane
  (`csa` on the row operand, `csb` on the column operand) — never a per-element
  branch, never a separate mode kernel. The complex product is the faithful
  4-mul / 2-add form (no Gauss/Karatsuba). alpha and beta are real, so scaling
  is a single `alpha*acc + beta*Cold`.
- **Triangle restriction**: full 2x2 tiles cover only cells strictly off the
  diagonal; the diagonal-straddling fringe and the odd row/column remainders
  use scalar cells with exact triangle bounds. The opposite triangle of C is
  **never read or written** — the gate compares the full C storage, which
  proves this.
- **Real-diagonal preservation**: the diagonal of a Hermitian C is real by
  construction. Diagonal cells accumulate a real sum of squares and store
  `imag = 0`, **ignoring any stored imaginary part** on the diagonal — exactly
  reproducing the reference `DBLE(...)` semantics. The gate injects large
  garbage into the stored-diagonal imaginary parts of C to verify this. The
  `alpha==0` / `K==0` fast path (scale the triangle by beta) preserves the same
  real-diagonal rule, and the degenerate no-op case `(alpha==0 || K==0) &&
  beta==1` returns C untouched, bit-for-bit with the reference.
- **Verification tier**: backward error (the tile reorders the K-summation; see
  `docs/optimization-policy.md`). Gated elementwise over the full C storage at
  relative tolerance `1e-13 * max(4, K)` across 21600 cases spanning both uplo,
  both trans (N: `A*A^H`, C: `A^H*A`), real alpha/beta in {0, 1, general},
  col/row/general strided+offset layouts for A and C independently, N/K spanning
  tile remainders (0,1,2,3,4,5,7,8,17,64), and garbage diagonal imaginary parts.
- **Speedup**: consistent ~1.3–2.1x across sizes/uplo/trans, rising to ~6x for
  large row-major trans=N where the reference's column-strided access pattern is
  pathological (the tiled kernel is layout-robust at ~8.7 GF/s). Geomean 1.79x;
  measured in `bench/zherk-opt/bench.mjs`.
- **Oracle preserved**: `bench/zherk-opt/variants/v0-reference.js`.
