---
id: 0109
title: The AAA/Laplace example scripts and benchmark do not run: their imports point at a removed layout
status: open
area: examples
opened: 2026-11-27
---

## Problem

`examples/aaa-pure.js` (the Node AAA implementation) and every script that imports it fail at module load, so none of them has run since the repository was reorganised. Nothing in CI or `npm test` loads them, so nothing reports it. The browser notebook avoids the problem only because `notebooks/aaa/aaa-entry.js` is a hand-maintained copy of the same algorithm, and the two copies drift: `aaa-pure.js` still passes the `lwork` argument that `zgesvd` no longer takes, which was fixed in the notebook copy only (ticket 0004 evidence, 2026-11-27).

## Evidence

- `examples/aaa-pure.js:8` imports `./lib/lapack/base/zgesvd/lib/ndarray.js` (no such path under `examples/`), and `:167` passes the stale `lwork` to `zgesvd`.
- `examples/laplace/laplace.js:7`, `examples/laplace/test.js:11`, `examples/laplace/profile.js:16` and `notebooks/aaa/generate-data.js:12` import `../../aaa-pure.js`, which resolves to the repository root, not `examples/`.
- `bench/bench-laplace.js` fails first on `./instrument.js` having no default export.

## Reproduce

```bash
for f in examples/aaa-pure.js examples/laplace/laplace.js examples/laplace/test.js bench/bench-laplace.js notebooks/aaa/generate-data.js; do node $f 2>&1 | grep -m1 Error; done
```
