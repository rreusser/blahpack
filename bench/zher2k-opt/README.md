# zher2k optimization — SHIPPED

Hermitian rank-2k update `C = alpha*A*B^H + conj(alpha)*B*A^H + beta*C`
(trans=N) / `alpha*A^H*B + conj(alpha)*B^H*A + beta*C` (trans=C), alpha COMPLEX,
beta REAL, one triangle of C updated. The most register-constrained kernel in
the complex level-3 family: rank-2k has two product terms per cell.

## Result

**Mode-dispatched.** Shipped to `lib/blas/base/zher2k/lib/base.js`.

- **trans=C → 2x2 fused two-term complex register tile** (`ctrans`, the settled
  complex geometry from `bench/zgemm-opt/GEOMETRY.md`). The two terms are fused
  into ONE complex accumulator per cell by folding alpha into hoisted column
  factors `t1 = alpha*B(l,j)`, `t2 = conj(alpha)*A(l,j)` — so the tile fits in 8
  accumulator doubles (a naive two-accumulator P/Q tile would spill). Consistent
  **~1.16–1.74x**.
- **trans=N → reference verbatim.** The fused tile recomputes the column temps
  per row-tile (~50% more FLOPs) and the reference already streams C with unit
  stride on column-major, so tiling *regresses* trans=N. Kept at exact reference
  parity (~1.00x); `ctrans` is a separate function so this path's codegen is
  untouched.
- **Geomean ~1.15x** over the full sweep. Gate: 75600 cases, 0 failures.

## Why not a single unified tile (unlike zherk)

`zherk` shipped one tile for both modes because its single product term
(`A*conj(A)`) has no alpha-folding temps — the tile does the same FLOPs as the
reference. `zher2k`'s **two** terms force per-row-tile temp recomputation, which
is FLOP-bound-lossy exactly where the reference is already good (column-major
trans=N). Measured: the pure tile regresses trans=N col-major ~5–8%. Dispatch by
trans captures the trans=C win with zero regression. This is the register/FLOP
penalty the family's GEOMETRY.md and this routine's PLAN.md flagged — it lands
here as expected.

## Files

- `variants/v0-reference.js` — preserved oracle (verbatim shipped reference).
- `variants/v1-tiled.js` — unified tile for BOTH modes (regresses trans=N; kept
  as the measured evidence for why dispatch is needed).
- `variants/v2-hybrid.js` — dispatch in one big function (small-N trans=N dips
  from codegen interference; superseded).
- `variants/v3-split.js` — **the shipped kernel**: dispatch with the tile in a
  separate `ctrans` function (trans=N parity restored).
- `check.mjs` — correctness gate over FULL C storage (both uplo, both trans,
  complex alpha / real beta {0,1,general}, col/row/gen layouts for A/B/C, tile
  remainders, GARBAGE diagonal imaginary parts). NaN-aware rtol `1e-13*max(4,K)`.
- `bench.mjs` — interleaved min-of-trials A/B; sweeps size × layout × uplo ×
  trans. Read the ratios, not the absolutes.

## Reuse notes

- Fused two-term tile: fold alpha into the column operand (`t1`, `t2`) to keep
  ONE complex accumulator per cell (8 doubles) instead of two (16, spills).
- Real-diagonal rule: diagonal cells store the real part with `imag=0`, ignoring
  stored diagonal imaginary parts (reference `DBLE` semantics). Top failure
  risk — the gate injects garbage diagonal imag to catch it.
- The opposite triangle is never written (the gate compares full C storage).
