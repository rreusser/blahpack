---
id: 0113
title: AAA goes erratic on sample sets with duplicate points, and the notebook boundaries contain duplicate corners
status: open
area: general
opened: 2026-11-27
---

## Problem

The AAA implementation in `notebooks/aaa/aaa-entry.js` assumes distinct sample points. When a point appears twice, choosing one copy as a support point leaves the other in the sample set with a zero Cauchy entry, so the approximant is evaluated wrongly there, the same point can be chosen as a support point again, and the iteration stops converging. The notebook's own L-shaped and square boundaries contain duplicate corner points, so the demos run on such input. Those cases still reach small boundary errors, but nothing guards against the failure.

## Evidence

- `exp(z)` on 60 distinct unit-circle points converges in 8 iterations; the same 60 points each listed twice does not converge in 20 (reproduction below). The behaviour predates the QR-updating change of 2026-11-27: the previous implementation gave an equally erratic error history on the same input and picked sample 0 as a support point twice.
- `notebooks/aaa/index.html:82` (`linspace`) includes both endpoints, and `buildLShapedBoundary` (`:89`) and `buildSquareBoundary` chain segments end to start, so every corner appears twice (6 duplicates on the L shape, 4 on the square). `notebooks/aaa/generate-data.js:26` has the same construction.
- `notebooks/aaa/aaa-entry.js`, the Cauchy column loop: `if (d === 0) { Cr[base] = 0; ... }` is where a duplicate of the support point gets a zero entry instead of being removed from the sample set.

## Reproduce

```bash
node --input-type=module -e "
import { aaa } from './notebooks/aaa/aaa-entry.js';
const pts = (n, period) => Array.from({ length: n }, (_, i) => { const t = 2 * Math.PI * (i % period) / period; return [Math.cos(t), Math.sin(t)]; });
const f = ([x, y]) => [Math.exp(x) * Math.cos(y), Math.exp(x) * Math.sin(y)];
for (const [label, Z] of [['60 distinct', pts(60, 60)], ['60 points, each twice', pts(120, 60)]]) {
  const r = aaa(Z, Z.map(f), 1e-13, 20);
  console.log(label + ': converged=' + r.converged + ' iterations=' + r.errvec.length + ' final error=' + r.errvec.at(-1).toExponential(1));
}"
```
