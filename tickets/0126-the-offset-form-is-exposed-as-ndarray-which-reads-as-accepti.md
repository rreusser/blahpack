---
id: 0126
title: The offset form is exposed as .ndarray, which reads as accepting ndarray objects
status: open
area: wrappers
opened: 2026-11-27
---

## Problem

Each module's data/strides/offsets entry point (`lib/ndarray.js`) is attached
to the default export as `.ndarray` and exported as a named `ndarray`. stdlib
uses that name for this signature, but it takes no ndarray objects. The
migration plan adds an opt-in ndarray-object form at `<pkg>/<routine>/ndarray`
(ticket 0111). Next to that, `zggev.ndarray` (data, strides, offsets) and
`lapack/zggev/ndarray` (ndarray objects) would mean different things under the
same name.

Decided (2026-11-27): the default export stays the layout form (`order`,
leading dimensions, `WORK = null` allocates). The offset form is renamed to
`.strided` (and the file to `strided.js`), keeping the named export in step.

## Evidence

- 915 modules attach `.ndarray`; 736 `index.js` files also export it by
  name, and the root `index.js` re-exports it as `<routine>Ndarray`.
- `ndarray.js` is named in 27 places in `CONVENTIONS.md` and in 112 files
  under `bin/` and `lint/`.

## Reproduce

```bash
grep -l "setReadOnly( [A-Za-z0-9_]*, 'ndarray'" lib/*/base/*/lib/main.js | wc -l
```
