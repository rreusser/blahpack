# zherk optimization — SHIPPED

Hermitian rank-k update `C = alpha*A*A^H + beta*C` (trans=N) / `alpha*A^H*A +
beta*C` (trans=C), alpha/beta REAL, one triangle of C updated.

## Result

**2x2 complex register tile over the stored triangle** (the settled complex
level-3 geometry from `bench/zgemm-opt/GEOMETRY.md`), triangle-restricted like
`bench/dsyrk-opt/`. Shipped to `lib/blas/base/zherk/lib/base.js`.

- Consistent **~1.3–2.1x**, up to ~6x for large row-major trans=N (bad baseline
  access pattern). **Geomean 1.79x.** Gate: 21600 cases, 0 failures.
- trans=N (row-major, large N) is zherk's analog of dsyrk's transposed-mode
  baseline weakness: the reference walks C by column with a large stride, so v0
  collapses to ~1.5 GF/s while the tiled kernel stays ~8.7 GF/s. trans=C is a
  steady ~2x (its baseline is already the register-accumulating dot form).

## Files

- `variants/v0-reference.js` — preserved oracle (verbatim shipped reference).
- `variants/v1-tiled.js` — the shipped 2x2 complex triangle-tiled kernel.
- `check.mjs` — correctness gate over FULL C storage (both uplo, both trans,
  real alpha/beta {0,1,general}, col/row/gen layouts, tile remainders, GARBAGE
  diagonal imaginary parts). NaN-aware rtol `1e-13*max(4,K)`.
- `bench.mjs` — interleaved min-of-trials A/B; sweeps size × layout × uplo ×
  trans.

## Reuse notes for the zher* / z-triangular followers

- One general-stride path; conjugation is a hoisted `±1` sign on the imaginary
  lane (`csa` row operand, `csb` column operand), not a branch or mode kernel.
- Faithful 4-mul/2-add complex product only (no Gauss — off-policy).
- Real-diagonal rule: diagonal cells store a real sum of squares with `imag=0`,
  ignoring stored diagonal imaginary parts (reference `DBLE` semantics). This is
  the top failure risk — the gate injects garbage diagonal imag to catch it.
- The opposite triangle is never written (the gate compares full C storage).
