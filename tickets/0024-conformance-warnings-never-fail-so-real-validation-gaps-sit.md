---
id: 0024
title: Conformance warnings never fail, so real validation gaps sit among 1,700 documentation warnings
status: open
area: conformance
opened: 2026-11-18
---

## Problem

`bin/conformance/classify.js` marks a module `complete` unless some check *fails*, so a `warn` never blocks anything. The same severity is used for missing documentation examples and for public functions that skip argument validation, so the real gaps are buried and nobody acts on them.

The sweep reports 1,842 warnings:
- 1,716 are missing `@example` blocks (`jsdoc.base-example`, `jsdoc.ndarray-example`);
- the rest, about 126, include correctness-relevant gaps.

## Evidence

- `conventions.ndarray-dimension-validation`, 24 modules: `ndarray.js` has `M`/`N` but never throws `RangeError`, so a negative dimension goes straight to `base.js`. They are `ddisna`, `dgghrd`, `zgghrd`, `dla_gbrfsx_extended`, `zla_herfsx_extended`, `dlaeda`, `dlaneg`, `dlarrk`, `dlarrr`, `dlarzt`, `dlasyf_rk`, `dsytf2_rook`, `zhetf2_rook`, `zla_lin_berr`, and 10 more.
- `implementation.ndarray-dimension-validation`, 2 modules: `dlasq5` and `dlasq6`.
- `conventions.routine-ld-validation`, 7 wrappers take a leading dimension they may not validate: `dla_porpvgrw`, `zla_porpvgrw`, `dlag2`, `dlagv2`, `dlaln2`, `dlasy2` and `zlaqz1`. The reference has no LD check for these, so `ld-rules` does not apply. Whether the wrapper should still require `LD >= rows` is undecided.
- `complex.reinterpret`, 91 modules: a heuristic ("z-prefix base.js missing reinterpret"). Many of these likely delegate all complex arithmetic and are noise. Its signal cannot be judged while it is just a warning.
- `complex.no-inline-division`, 1 module (`zlahef`): possible inline complex division.
- `implementation.base-is-private`, 1 module (`izamax`).

## Reproduce

```bash
node bin/conformance.js --all --fast --json > /tmp/conf.json; node -e 'const r=require("/tmp/conf.json").modules;const by={};for(const m of r)for(const c of m.checks)if(c.status==="warn")by[c.id]=(by[c.id]||0)+1;console.log(by)'
```
