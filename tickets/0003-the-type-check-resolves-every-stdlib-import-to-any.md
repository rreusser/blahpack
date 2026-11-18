---
id: 0003
title: The type check resolves every stdlib import to `any`
status: open
area: typecheck
opened: 2026-11-18
---

## Problem

`npm run typecheck` imports stdlib through explicit `.../lib/index.js` paths, which TypeScript resolves to untyped JavaScript in `node_modules`. Every stdlib function and class is therefore `any`. Wrong argument counts and types at stdlib call sites are invisible, and `Complex128Array` is indistinguishable from `Float64Array`. This is how 11 three-argument calls to the two-argument `max`/`min` got through. The `no-nary-stdlib-minmax` lint rule now covers that one function pair only.

## Evidence

- stdlib ships declarations at `node_modules/@stdlib/<pkg>/docs/types/index.d.ts`.
- Mapping the imports to them (plus `esModuleInterop`) yields 39 errors, all real. They include tickets 0001, 0002 and 0007, and `zunhr_col` reading `.re` from a value that may be `void`.

## Reproduce

```bash
node -e 'const b=require("./tsconfig.json");Object.assign(b.compilerOptions,JSON.parse(process.argv[1]));require("fs").writeFileSync("tsconfig.probe.json",JSON.stringify(b))' '{"esModuleInterop":true,"baseUrl":".","paths":{"@stdlib/*/lib/index.js":["node_modules/@stdlib/*/docs/types/index.d.ts"]}}' && npx tsc -p tsconfig.probe.json | grep -c 'error TS'; rm -f tsconfig.probe.json
```
