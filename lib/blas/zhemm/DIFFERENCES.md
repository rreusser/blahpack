# zhemm: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — 2x2 complex register tile over a packed Hermitian operand

The reference (BLAS 3.12.0 `zhemm.f90`) walks the stored triangle of the
Hermitian operand element-by-element with the classic two-accumulator update
(`C[k,j] += temp1*A[k,i]`, `temp2 += B[k,j]*conj(A[k,i])`). Our `base.js`
instead *materializes* the Hermitian operand two rows at a time from the stored
triangle into a small module-level scratch buffer and then runs a **2x2 complex
register-tiled** gemm microkernel over it — the settled complex level-3 tile
geometry (`bench/zgemm-opt/GEOMETRY.md`: a complex accumulator is two doubles, so
2x2 is the widest tile that stays under V8's spill budget).

- **Packing / Hermitian materialization**: each packed row `S[r,p] = A[r,p]` is
  read directly from the stored triangle where present, and from the mirror
  conjugated (`A[r,p] = conj(A[p,r])`) otherwise. Packing is O(2K) amortized
  over the whole column sweep of `C`. This is the complex analog of the
  `dsymm` row-packing optimization, except the mirror entries are **conjugated**
  rather than copied (Hermitian, not symmetric). Packing lost as a pure speed
  lever on dense `zgemm`, but a follower that must build one operand from a
  stored triangle packs it for correctness regardless.
- **Real diagonal preserved exactly**: the reference references only
  `DBLE(A(j,j))` on the diagonal. The packer reads only the real part and forces
  the packed imaginary part to `0.0`, so any garbage stored in the diagonal's
  imaginary slot is ignored bit-for-bit as in the reference. The gate poisons
  `A`'s stored diagonal imaginary parts with large sentinels (`1e6*(d+1)`) and
  confirms the outputs still match.
- **`side='right'` folds into the same kernel**: `C := alpha*B*A + beta*C` is
  `C^T := alpha*conj(A)*B^T + beta*C^T` because `A^T = conj(A)` for Hermitian
  `A`. The kernel runs with the `B`/`C` stride pairs swapped and the packed `A`
  conjugated via a hoisted `csa = -1` sign on its imaginary lane (never a
  per-element branch) — one general-stride code path covers both sides, both
  triangles, and all layouts.
- **Verification tier**: backward error (the tile reorders the K-summation; see
  `docs/optimization-policy.md`). Gated against the preserved reference kernel at
  a NaN-aware relative tolerance `2e-15 * (max(M,N)+4)` over the FULL `C`
  storage — 8328 cases spanning both sides, both triangles, complex alpha/beta
  in {0,1,general}, col/row/general/negative strides for `A`/`B`/`C`, offsets,
  garbage diagonal imaginary parts, and `M`/`N` spanning tile remainders
  (0,1,2,3,4,5,7,8,17,64) in `bench/zhemm-opt/check.mjs` (worst observed rel.
  err. ~4e-14). `A` and `B` are asserted never written.
- **Speedup**: consistent **1.58–2.37x** across size × side × uplo (geomean
  ~1.93x), reaching the shipped `zgemm` roofline; measured in
  `bench/zhemm-opt/bench.mjs`. The `right` side gains most (the reference's
  right-side access pattern is the least cache-friendly).
- **Oracle preserved**: `bench/zhemm-opt/variants/v0-reference.js`.
