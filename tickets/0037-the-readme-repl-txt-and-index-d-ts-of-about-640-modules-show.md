---
id: 0037
title: The README, `repl.txt` and `index.d.ts` of about 640 modules show the wrong call signature
status: open
area: docs
opened: 2026-11-20
---

## Problem

The strided-wrapper codemods (PR #19) and the spec renames (PRs #25–#27) changed `lib/<routine>.js` signatures, but the generated docs were not regenerated, and nothing compares them with the code. A user following the README or the TypeScript types passes arguments the wrapper does not take. PR #19 ("Known gaps, not gated") and PR #26 ("`docs/types/index.d.ts` are not updated") recorded this in prose only.

## Evidence

Comparing each module's `function <r>( ... )` in `lib/<r>.js` with its docs, over 912 modules:
- `docs/repl.txt` `{{alias}}( ... )`: 652 differ.
- `README.md` `#### <r>( ... )`: 637 differ.
- `docs/types/index.d.ts` first call signature: 634 differ.
- Example: `ddot( N, x, strideX, y, strideY )` is documented in all three as `( N, x, strideX, offsetX, y, strideY, offsetY )`, and the `.d.ts` says it returns `Float64Array`.
- `docs/types/test.ts` (the scaffold's type tests) assert the same wrong signatures, e.g. `ddot( 10 ); // $ExpectType Float64Array`, and nothing compiles them: `tsconfig.json` includes only `lib/*/base/*/lib/*.js`.
- `README.md` usage sections show the same wrong signatures as `repl.txt`.
- `docs/repl.txt` files also carry a stray `@license Apache-2.0.` line as the description (e.g. `lib/blas/base/ddot/docs/repl.txt:2`).

## Reproduce

```bash
grep -n '^function' lib/blas/base/ddot/lib/ddot.js; head -2 lib/blas/base/ddot/docs/repl.txt; grep -n 'number' lib/blas/base/ddot/docs/types/index.d.ts | head -1
```

## Progress

- 2026-11-27: `README.md` is fixed. `bin/docs/readme.js` generates every module README from the same model as the API reference site (the JSDoc of `lib/index.js`, the layout wrapper and `ndarray.js`; `spec/<routine>.json`; `examples/index.js`; `data/fortran-routine-docs.json`), and CI runs `npm run readme:check`. The hand-written README prose (intro and notes of 179 modules) moved into the module JSDoc first (`bin/codemod-readme-notes.mjs`).
- Still open: `docs/repl.txt` and `docs/types/index.d.ts` (and `docs/types/test.ts`) show the wrong signatures and nothing generates or checks them. `repl.txt` could come from the same model (`bin/docs/extract.js`); `index.d.ts` needs its types from the JSDoc.
