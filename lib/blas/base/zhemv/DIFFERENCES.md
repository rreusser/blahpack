# zhemv: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — 4-wide register-blocked fused-triangle traversal

The reference (BLAS 3.12.0 `zhemv.f90`) walks the stored triangle of the
Hermitian matrix one column at a time, doing a separate scalar pass for the
row (`A*x`) and the mirrored conjugate column contribution. Our `base.js`
adapts the shipped `dsymv` optimization: a fused traversal of the stored
triangle with 4-wide register blocking, so each loaded `A[i,l]` serves both
its row-update and its mirrored `conj(A[l,i])` column-reduction use. The
conjugation is applied on exactly one of the two uses via a sign flip on the
imaginary part, hoisted out of the inner loop.

- **Verification tier**: backward error (the fused traversal reorders the
  summation; see `docs/optimization-policy.md`). Gated against the preserved
  reference kernel at rel. tol. `1e-13*max(4,N)` over the FULL `y` storage
  across 2592 cases in `bench/zhemv-opt/check.mjs` — both triangles, complex
  `alpha`/`beta` in {0, 1, general}, strided/offset/negative-stride `x` and
  `y`, and `N` spanning the 4-wide remainder.
- **Real-diagonal semantic preserved exactly**: the reference references only
  `DBLE(A(j,j))` on the diagonal. The optimized kernel reads only the real
  part of each stored diagonal element and ignores the stored imaginary part.
  The gate writes nonzero garbage into every stored diagonal imaginary slot
  and confirms `v0`/`v1` agree, proving the semantic is preserved.
- **Cost**: measured ~1.44x faster (≈6.9 → ≈10 GF/s) consistently across
  sizes and both triangles; nothing below 0.9x. Measured in
  `bench/zhemv-opt/bench.mjs`. The kernel is compute-bound on the complex
  multiplies (4 mul + 2 add each, unchanged — no Gauss/3-multiply, which
  would alter rounding and is off-policy), so blocking amortizes only the
  `x`/`y` memory traffic; ~1.44x is the resulting ceiling.
- **Oracle preserved**: `bench/zhemv-opt/variants/v0-reference.js`.
