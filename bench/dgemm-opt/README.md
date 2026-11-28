# dgemm optimization experiment

Self-contained, reproducible exploration of optimizing the stdlib-js `dgemm`
(double-precision general matrix multiply) JavaScript kernel. Every candidate
implementation is preserved as a standalone source file so the work can be
**re-run and re-validated on other machines / Node versions**.

## Layout

```
variants/            # Candidate kernels (each a drop-in for lib/.../dgemm/lib/base.js)
  v0-reference.js    #   Simple reference triple loop (local repo's old kernel)
  upstream-stdlib.js #   CURRENT shipping @stdlib/blas/base/dgemm (tiled+ddot+layout-aware)
  v1-unitstride.js   #   NN, unit row-stride specialization
  v2-regblock-n4.js  #   NN, 4-wide register blocking over columns (axpy form)
  v3-tile4x4.js      #   NN col-major, 4x4 register tile (dot-product form)
  v4-general4x4.js   #   *** General 4x4 register tile: ALL transpose modes + layouts
  v5-blocked4x4.js   #   v4 + N/K cache blocking
  v6-blocked3lvl.js  #   v4 + M/N/K (3-level) cache blocking
  gen-<MR>x<NR>.js   #   Auto-generated register tiles of varying geometry
harness.js           # Min-of-trials, interleaved timing core
check.js             # Correctness gate: every variant vs v0 over a case matrix
run.js               # Sweep driver (shape x transpose x layout -> GFLOP/s)
probe.js             # Quick CLI comparison (env-configurable)
probe-shapes.js      # Non-square shape comparison
gen-tile.js          # Code generator for register-tiled kernels
report.js            # Full markdown report generator (tables)
svg.js               # Dependency-free SVG line/bar charting
plots.js             # Generates the report's SVG figures
build-html.js        # Compiles the report to a single self-contained HTML file
render-png.sh        # Rasterizes SVG figures -> PNG (needs Chrome)
reports/             # Generated report + figures
  dgemm-optimization.md     #   *** The report (markdown) — start here
  dgemm-optimization.html   #   Self-contained HTML (figures inlined)
  fig*.svg / fig*.png       #   Figures (SVG referenced by the markdown; PNG fallback)
```

**The report is `reports/dgemm-optimization.md`** — it leads with the bottom
line and embeds the figures.

All files are CommonJS (`package.json` here pins `"type":"commonjs"`; the repo
root is an ES-module package). The variant files use the exact `base.js`
signature, so a winner can be copied straight into
`lib/blas/dgemm/lib/base.js`.

## Reproducing

```bash
cd bench/dgemm-opt

# 1. Correctness — every variant must match v0 bit-for-bit (mod f64 reordering):
node check.js

# 2. Quick comparison (configurable via env vars):
VARIANTS=v0-reference,v4-general4x4 SIZES=64,256,512 node probe.js
#   TA / TB    : transpose mode ('no-transpose' | 'transpose')
#   LAYOUT     : 'col' | 'row'
#   SIZES      : comma-separated square dimensions
#   TRIALS     : interleaved trials per variant (default 15)
#   TARGET     : target ms per timed batch (default 50)

# 3. Full report -> reports/dgemm-optimization.md (re-runs the sweeps):
node report.js
node plots.js             # regenerate the SVG figures
node build-html.js        # compile markdown -> self-contained reports/*.html
bash render-png.sh        # optional: SVG -> PNG fallbacks (needs Chrome)

# 4. Regenerate the tile-geometry variants:
node gen-tile.js          # default geometry set
node gen-tile.js 4x4 8x4  # specific MRxNR tiles
```

## Methodology (why the numbers are trustworthy on a noisy machine)

This work was done on a shared machine under heavy concurrent load. Two
defenses make the comparisons valid:

1. **Minimum-of-trials timing.** External CPU contention can only *add* wall
   time, never remove it, so the minimum per-iteration time over many trials is
   the best available estimate of the true cost on the hardware.
2. **Round-robin interleaving.** Within a run, variants are timed back-to-back
   in rotation, so slow drift (thermal throttling, background jobs ramping)
   affects all variants equally. **Speedup *ratios* are therefore far more
   robust than absolute GFLOP/s** — read the ratios as the headline result.

FLOP count (`2·M·N·K`) is identical across variants, so GFLOP/s is directly
comparable. The correctness gate uses a combined absolute/relative tolerance to
avoid flagging benign catastrophic-cancellation cases (e.g. `alpha*AB + beta*C`
landing near zero).

## Key findings

See `reports/dgemm-optimization.md` for the full data. Headlines:

- **Register tiling is the dominant win.** A 4x4 register tile (C accumulated in
  registers across the full K loop, dot-product form) reaches ~**4x** the
  reference on square matrices that fit in cache.
- **It generalizes.** Expressed in terms of effective row/col strides
  (`v4-general4x4`), the same kernel covers all four transpose modes
  (NN/TN/NT/TT) and both row- and column-major layouts at ~4x.
- **V8 codegen is sensitive to variable declaration order.** Declaring the 16
  tile accumulators *before* loop counters/pointers gave a reproducible ~15%
  improvement (see `gen-tile.js`).
- **Wider tiles spill.** 8x4 / 4x8 / 6x6 are slower than 4x4 — past 16 f64
  accumulators V8 spills registers.
- **Large matrices hit a memory-bandwidth wall.** The flat register kernel
  collapses toward reference speed once A/B/C exceed cache (~1536+). Cache
  blocking (`v5`, `v6`) targets that regime.
- **vs the actually-shipping kernel, the win is larger (~5.3–6.4×)** and
  **layout-agnostic.** The shipping `upstream-stdlib` kernel detects row/column
  layout and special-cases one combo; the register tile is uniformly fast across
  all layout combinations (`node probe-layout.js`), so that detection machinery
  buys nothing once register/cache use is good.
