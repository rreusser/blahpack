# zgemm optimization experiment (complex level-3 flagship)

Settles the register-tile geometry for the complex BLAS level-3 family. The
headline finding — **the 2x2 complex register tile** — is written up in
[`GEOMETRY.md`](GEOMETRY.md); the followers (zhemm/zherk/zher2k/ztrmm/ztrsm)
reuse it.

## Layout

```
variants/
  v0-reference.js   # preserved oracle — verbatim copy of the shipped reference kernel
  gen-<MR>x<NR>.js  # auto-generated complex register tiles (dot-product form)
  pack-2x2.js       # split re/im scratch-packing variant (independent lever)
gen-tile.cjs        # complex tile code generator (CommonJS; writes ESM variants)
check.mjs           # correctness gate: every variant vs v0 over the full case matrix
bench.mjs           # A/B min-of-trials benchmark (sizes x modes -> speedup ratios)
GEOMETRY.md         # the geometry sweep result (the deliverable)
```

Variant files use the exact `base.js` signature (`transa, transb, M, N, K,
alpha, A, sa1, sa2, oa, B, sb1, sb2, ob, beta, C, sc1, sc2, oc`; alpha/beta are
`Complex128`, matrices are `Complex128Array`), so the winner copies straight
into `lib/blas/base/zgemm/lib/base.js`.

## Reproducing

```bash
cd bench/zgemm-opt

node gen-tile.cjs                 # (re)generate the tile variants
node check.mjs                    # correctness: all variants vs v0 (rtol tier)
node check.mjs ./variants/pack-2x2.js          # a single variant
node check.mjs ../../lib/blas/base/zgemm/lib/base.js   # gate the SHIPPED kernel
node bench.mjs                    # geometry sweep (default representative set)
node bench.mjs gen-2x2.js gen-4x2.js gen-2x4.js pack-2x2.js
```

## Methodology

Same as `bench/dgemm-opt`: minimum-of-trials timing with round-robin
interleaving, so slow drift on a shared machine hits all variants equally and
the **speedup ratios** are the trustworthy output (not absolute GF/s). The
benchmark uses fresh finite operands with `alpha=1, beta=0` so each call
overwrites `C` (operands never underflow toward zero across repeated calls —
the d-campaign benchmark trap), and asserts `C` stays finite.

The gate is the backward-error tier (`docs/optimization-policy.md`): tiling
reorders the K-summation, so variants are compared to the reference at a
K-scaled relative tolerance over the full `C` storage, across all nine op
combos, complex alpha/beta, and col/row/negative/padded/offset layouts.

## Result

**2x2 complex register tile, ~1.63x geomean** (1.5–1.7x across all nine modes,
sizes 8–256), shipped. Wider tiles (4x2/2x4) spill the doubled complex
accumulators; split re/im packing (~1.08x) does not repay its overhead on
compute-bound complex gemm. See `GEOMETRY.md`.
