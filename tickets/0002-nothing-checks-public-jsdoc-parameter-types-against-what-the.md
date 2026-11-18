---
id: 0002
title: Nothing checks public JSDoc parameter types against what the routines read and write
status: open
area: docs
opened: 2026-11-18
---

## Problem

The JSDoc on `ndarray.js` and the layout wrapper is the public contract, but nothing compares it with `base.js`. Scaffold placeholders with wrong types survive. A caller who follows the docs passes a number where the routine writes `x[0]`, which throws in strict-mode ESM, or allocates the wrong kind of array.

## Evidence

- Outputs documented as `{number}` while `base.js` writes `x[0]`:
  - `rcond` in `dsycon_rook.js`, `zhecon_rook.js` and `zppcon/lib/ndarray.js`;
  - `RCOND` in `ztbcon/lib/ndarray.js`;
  - `scale` in `ztgsy2/lib/ndarray.js`;
  - `M` in `dtgsen`.
  Sibling files often document the same parameter correctly; `zppcon.js` says `Float64Array`.
- About 19 complex wrappers declare `WORK` as `Float64Array` and then assign a `Complex128Array` to it.
- `dtgevc` documents `SELECT` as `Float64Array`, but its callers pass `Uint8Array`.
- 2,225 `@param` descriptions across `lib/` are just the parameter's own name (`rcond - rcond`).

## Reproduce

```bash
node -e 'const b=require("./tsconfig.json");Object.assign(b.compilerOptions,JSON.parse(process.argv[1]));require("fs").writeFileSync("tsconfig.probe.json",JSON.stringify(b))' '{"esModuleInterop":true,"baseUrl":".","paths":{"@stdlib/*/lib/index.js":["node_modules/@stdlib/*/docs/types/index.d.ts"]}}' && npx tsc -p tsconfig.probe.json | grep -E 'TS2345|TS2739'; rm -f tsconfig.probe.json
```
