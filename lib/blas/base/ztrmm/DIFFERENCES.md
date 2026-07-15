# ztrmm: Differences from the Reference Implementation

## [OPTIMIZATION] base.js — 2x2 complex register-tiled triangular multiply

The reference (BLAS 3.12.0 `ztrmm.f`) walks B one complex element at a time
through eight branchy `side`/`uplo`/`transa` code paths, recomputing indices
per element and skipping work via `!= 0` guards. Our `base.js` replaces the
inner computation with a single pair of directional register-tiled kernels
(one for the effective-upper triangle, one for the effective-lower), each
accumulating a **2x2 complex tile** (8 accumulator doubles — within V8's
~16-f64 spill budget; a 4x4 complex tile is 32 doubles, over budget) plus its
2x2 diagonal corner of B held in registers.

- **All eight `side`/`transa` cases fold into the two kernels via effective
  strides.** `B := alpha*B*op(A)` is `B^T := alpha*op(A)^T*B^T`, a left-side
  problem with A's and B's strides swapped and `uplo` flipped; `transa` in
  `{transpose, conjugate-transpose}` swaps A's strides and flips `uplo` again
  (the shipped `dtrmm` precedent, `bench/dtrmm-opt/`).
- **op = A^H (conjugate-transpose)** — a third mode `dtrmm` lacked — is folded
  into a hoisted sign `conjSign` (`-1` for conjugate-transpose, else `+1`)
  applied to every imaginary A value at load, never a per-element branch.
- **In-place ordering is preserved.** The effective-upper kernel walks 2-row
  tiles top-down and the effective-lower kernel bottom-up, so every row a tile
  reads is either not yet overwritten or cached from the tile's own 2x2
  diagonal corner of B (read into registers before the tile is written). The
  odd remainder row is processed after the tiles (upper) or first, descending
  (lower). This mirrors the reference's in-place traversal direction exactly.
- **`diag = 'unit'`** substitutes `1+0i` for the diagonal without reading it,
  and the reference `!= 0` skip-guards are dropped (dgemm precedent). The
  `alpha == 0` quick path (zeroing B) is preserved.

- **Verification tier**: backward error (the tiled kernel reorders the
  summation across each row's reduction; see `docs/optimization-policy.md`).
  Gated against the preserved reference kernel with a NaN-aware relative
  tolerance `1e-13 * max(4, max(M,N))` over the **full interleaved B storage**
  (catching stray writes) across 32928 cases in `bench/ztrmm-opt/check.mjs`:
  all `side`/`uplo`/`transa` (N,T,C)/`diag` combos, complex alpha
  `{0, 1, general}`, col/row/general/negative strides and nonzero offsets for
  both A and B, and M/N spanning the tile remainder (0,1,2,3,4,5,7,8,17,64).
  The check also asserts A is bit-identical after the call (read-only; the
  untouched triangle is random garbage, so any illegal read shows as a
  mismatch).
- **Speedup**: ~2.0–2.4x across all modes and sizes (up to ~7.8x for
  row-major B, where the reference's access pattern is cache-hostile);
  measured in `bench/ztrmm-opt/bench.mjs`, which uses a near-identity
  triangular A and asserts B stays finite/nonzero to avoid the underflow trap
  that fakes throughput when repeated in-place calls drive B to zero.
- **Oracle preserved**: `bench/ztrmm-opt/variants/v0-reference.js`.
