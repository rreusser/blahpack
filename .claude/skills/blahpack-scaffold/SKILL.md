---
name: blahpack-scaffold
description: Generate the stdlib-js module scaffold for a BLAS/LAPACK routine
argument-hint: <routine>
---

Generate the stdlib-js module scaffold for a BLAS/LAPACK routine. Run:

```
python bin/scaffold.py $ARGUMENTS
```

The first argument is the package (`blas` or `lapack`), the second is the routine name. Add `-d "description"` for the one-line description.

If the user provides just a routine name, determine the package by checking whether the source exists in `data/BLAS-3.12.0/` (blas) or `data/lapack-3.12.0/SRC/` (lapack).

The scaffold generates the full file set (CONVENTIONS F1):
- `lib/base.js` — stub with correct signature (implement this)
- `lib/ndarray.js` — validation wrapper for stdlib string params (uplo, trans, diag, side)
- `lib/<routine>.js` — strided wrapper with string, dimension, and LD validation, plus `order`/`isLayout` when D1 applies
- `lib/main.js`, `lib/index.js` — entry points
- `test/test.js` — export/arity checks
- `test/test.<routine>.js` — layout wrapper validation tests
- `test/test.ndarray.js` — scaffold for ndarray computation tests
- `benchmark/benchmark.js`, `benchmark/benchmark.ndarray.js`
- `docs/types/index.d.ts` — dual signatures with @stdlib/types imports
- `docs/types/test.ts` — TypeScript compile-time tests
- `docs/repl.txt`, `README.md`, `examples/index.js`, `package.json` (with keywords)
- `LEARNINGS.md` — template

After scaffolding, the translator only needs to:
1. Implement `lib/base.js`
2. Write real tests in `test/test.ndarray.js`
3. Add whitelist validation in `ndarray.js` and `<routine>.js` for nonstandard option params (job, norm, etc.; CONVENTIONS V3, N8)
4. Fill in LEARNINGS.md
