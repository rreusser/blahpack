---
id: 0124
title: Every module has a main.js that only attaches .ndarray: stdlib's native-addon indirection, unused here
status: resolved
area: conventions
opened: 2026-11-27
resolved: 2026-11-27
---

## Problem

Each of the 915 modules has `lib/main.js`, which imports `<routine>.js` and
`ndarray.js`, attaches the second to the first as `.ndarray` with
`setReadOnly`, and default-exports it. `index.js` then re-exports it. In
stdlib the split exists because `index.js` chooses between a native addon
and `main.js`. This repository has no native addons (CONVENTIONS F3 says so),
so `main.js` is a file per module that does nothing `index.js` could not do
itself. CONVENTIONS F1 and F3 and their enforcers require it, and the
scaffold generates it, so every new module adds another.

It goes away naturally if the layout is flattened and the default export
becomes the ndarray-object wrapper (ticket 0111), and could be dropped before
then.

## Evidence

- `ls lib/*/base/*/lib/main.js`: 915 files. 888 have the same four statements
  (two imports, `setReadOnly( fn, 'ndarray', ndarray )`, a typed default
  export); the other 27 differ in form, not in purpose.
- Nothing imports `main.js` except each module's own `lib/index.js`
  (searched `lib/`, `bin/`, `test/`, `bench/`, `notebooks/`, `examples/`).
- The one thing it carries is the JSDoc cast
  `/** @type {typeof fn & { ndarray: typeof ndarray }} */` that gives
  `.ndarray` its type for `tsc` (S14, `ci:typecheck:callers`). It has to move
  into `index.js` with the attachment.
- What requires it: CONVENTIONS F1 (file set) and F3; `bin/conformance/checks/`
  `file-structure.js`, `conventions.js` (`main-requires-both`,
  `main-setreadonly`), `scaffolding.js`, `scaffold-noise.js`;
  `lint/rules/module-exports` and its fixtures; `bin/scaffold.py`.

## Reproduce

```bash
ls lib/*/base/*/lib/main.js | wc -l; grep -rlE "from '[^']*main\.js'" lib --include=*.js | grep -v '/lib/index.js$' | wc -l
```

## Resolution

Folded by bin/codemod-fold-main.mjs on branch slop/awesome-wright-lxi5gy: every lib/index.js now attaches .ndarray with setReadOnly, carries the typed default export, and exports ndarray by name; all 915 main.js files are deleted. CONVENTIONS F1/F3 drop main.js. What prevents a recurrence: conf:file-structure.no-forbidden-files fails on any lib/main.js (fix: the codemod), lint:module-exports requires the attachment, the typed default and the named export in index.js, conf:conventions.index-imports-both and index-setreadonly (now fail-level), and bin/scaffold.py no longer generates main.js. Found along the way and fixed here: bin/docs/extract.js never recognised the typed default export, so no docs page had a layout signature and the offset form was shown as the default call (regression test: bin/lib/docs-extract.test.mjs).
