---
id: 0117
title: Nothing renders the notebooks in a browser, so their WebGPU output and page wiring are unverified
status: open
area: notebooks
opened: 2026-11-27
---

## Problem

The notebooks (`notebooks/aaa`, `notebooks/naca`, `notebooks/pseudospectra`) are deployed pages, but no check loads one in a browser. `npm run test:notebooks` covers the solvers the AAA notebook's worker calls, and the deploy workflow builds the site, but the page code itself (the cells in `index.html`, the worker messages, the WGSL shaders and the WebGPU pipelines) runs only when someone opens the page. A break there ships unnoticed, as the stale `zgesvd` call did (ticket 0004 evidence, 2026-11-27).

## Evidence

- 2026-11-27, by hand: the built site was loaded in headless Chromium with the CDN libraries served locally. The AAA notebook's worker computed all three sections and the plots rendered; the NACA notebook solved both of its cases. The WebGPU field canvases were blank and the page logged `OperationError: Instance dropped error in getCompilationInfo` and `[WebGPU] Device lost`. A build of `main` behaved the same, so this is the headless software WebGPU device, and the field renderings (`notebooks/aaa/visualize.wgsl`, `stokes.wgsl`) remain unverified on a real GPU.
- `.github/workflows/deploy.yml` bundles and builds the notebooks; no step opens them. `ci.yml` never builds the notebook pages at all.
- CI already installs Chromium through Playwright for the `Browser dist` job (`npm run check:dist`), which loads each routine's browser module but no notebook. A notebook check could reuse that job.
- `notebooks/pseudospectra` has no test of any kind.

## Reproduce

```bash
grep -c "vite build" .github/workflows/ci.yml   # 0: CI never builds the notebook pages, so none is opened
```
