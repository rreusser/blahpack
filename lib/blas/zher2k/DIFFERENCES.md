# zher2k: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — mode-dispatched: 2x2 fused two-term complex tile for trans=C

The reference (BLAS 3.12.0 `zher2k.f`) computes the Hermitian rank-2k update
`C := alpha*A*B^H + conj(alpha)*B*A^H + beta*C` (trans=N) or
`C := alpha*A^H*B + conj(alpha)*B^H*A + beta*C` (trans=C), beta REAL, over one
triangle of C, with a beta-scaling pass followed by rank-1 (trans=N) or
dot-product (trans=C) accumulation. Our `base.js` **dispatches by trans**,
because the rank-2k structure makes a single tiled kernel a net loss on one of
the two modes (see below).

- **trans='conjugate-transpose'** uses a **2x2 complex register tile** over the
  stored triangle (the settled complex level-3 tile geometry; see
  `bench/zgemm-opt/GEOMETRY.md`), kept in its own function `ctrans` so the
  no-transpose path retains its original codegen. The two rank-2k product terms
  (`alpha*A^H*B` and `conj(alpha)*B^H*A`) are **fused into a single complex
  accumulator per cell** by folding alpha into hoisted column factors
  `t1 = alpha*B(l,j)` and `t2 = conj(alpha)*A(l,j)` (the reference temp1/temp2),
  so `acc(i,j) += op(A)_row·t1 + op(B)_row·t2` needs only **8 accumulator
  doubles** for the tile — the register-fit that a naive two-accumulator
  (P and Q) tile would blow. C is touched once per cell and the row loads are
  reused across the tile. Transpose folds into effective strides `(ar, ak)`;
  the row-operand conjugation is applied inline on the imaginary lane. The
  reference recomputes an O(K) strided dot product per cell, so the tile wins.
- **trans='no-transpose'** keeps the reference rank-1-update structure
  **verbatim**. For that mode the fused two-term tile must recompute the column
  temps once per row-tile — ~50% more FLOPs than the reference — while the
  reference already streams C with unit stride on the common column-major
  layout. Tiling measurably *regresses* trans=N there (unlike single-term
  `zherk`, whose tile has no temp-recomputation penalty). Dispatching by trans,
  with `ctrans` as a separate function, holds trans=N at exact reference parity.
- **Faithful complex product**: 4-mul / 2-add form only (no Gauss/Karatsuba —
  that changes per-element rounding and is off-policy).
- **Real-diagonal preservation**: the diagonal of a Hermitian C is real by
  construction. Diagonal cells accumulate only the real part of the two-term sum
  and store `imag = 0`, **ignoring any stored imaginary part** on the diagonal —
  exactly reproducing the reference `DBLE(...)` semantics. The gate injects
  large garbage into the stored-diagonal imaginary parts of C to verify this.
  The `alpha==0` / `K==0` fast path (scale the triangle by beta) preserves the
  same rule, and the degenerate no-op `(alpha==0 || K==0) && beta==1` returns C
  untouched.
- **Triangle restriction**: full 2x2 tiles cover only cells strictly off the
  diagonal; the diagonal-straddling fringe and odd row/column remainders use
  scalar cells with exact triangle bounds. The opposite triangle of C is
  **never read or written** — the gate compares the full C storage.
- **Verification tier**: backward error (the tile reorders the K-summation; see
  `docs/optimization-policy.md`). Gated elementwise over the full C storage at
  relative tolerance `1e-13 * max(4, K)` across 75600 cases spanning both uplo,
  both trans, complex alpha and real beta each in {0, 1, general},
  col/row/general strided+offset layouts for A, B and C independently, N/K
  spanning tile remainders (0,1,2,3,4,5,7,8,17,64), and garbage diagonal
  imaginary parts.
- **Speedup**: trans=C a consistent ~1.16–1.74x across sizes/uplo/layouts
  (rising to ~1.7x for large row-major, where the reference's strided access is
  pathological); trans=N held at reference parity (~1.00x). Geomean ~1.15x over
  the full sweep. Measured in `bench/zher2k-opt/bench.mjs`.
- **Oracle preserved**: `bench/zher2k-opt/variants/v0-reference.js`.
