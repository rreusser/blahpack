---
id: 0086
title: The library has no published API reference generated from the code, and the JSDoc it would publish is unchecked
status: open
area: docs
opened: 2026-11-25
---

## Problem

There is no browsable reference for the 912 routines. A person or agent who
wants to call `zheevr` has to open its source files and the generated spec and
reconcile them by hand. The GitHub Pages site hosts only notebooks and
`progress.html`.

Requirement: every word on the site comes from the code (JSDoc or TypeScript
annotations) or from committed generated data (`spec/*.json`). Deleting the
built site and rebuilding it loses nothing.

The JSDoc such a site would publish is unchecked:
- placeholder `@param` descriptions (`N - N`; ticket 0002);
- summaries truncated by earlier codemods ("Performs one of the matrix-matrix
  operations:.") or replaced by a stray `@license` tag;
- `@example` blocks written in CommonJS for an ESM package, and many that throw
  or make false claims.

The other doc copies (`README.md`, `repl.txt`, `index.d.ts`) drift from the code
too (ticket 0037). The standalone `examples/index.js` files are ticket 0041.

## Evidence

- `.github/workflows/deploy.yml` on `0900da7d9` builds only `notebooks/` (vite)
  and copies `progress.html`.
- `@module @scope/pkg` makes doctrine drop **every** tag of a comment, so
  tools that parse JSDoc silently miss the examples of 178 modules.
- `lib/blas/base/zgemm/lib/zgemm.js` summary: "Perform one of the complex
  matrix-matrix operations:."; `lib/blas/base/dgbmv/lib/dgbmv.js` has
  `@license Apache-2.0` where the summary belongs.

## Reproduce

```bash
grep -l '@license Apache' lib/*/base/*/lib/*.js | wc -l; grep -c ':\.$' lib/*/base/*/lib/*.js | grep -v ':0$' | wc -l
```

## Work so far

Branch `docs-site`.

- `bin/docs/`: a generator, `npm run docs:build` (preview: `npm run docs:serve`),
  builds HTML, per-routine `.md`/`.json`, `llms.txt`, `llms-full.txt` and
  `api.json` from JSDoc plus `spec/*.json`. `deploy.yml` publishes it at the
  Pages root, alongside the notebooks.
- Gates (CONVENTIONS J6–J8), sharing one predicate library with the site's
  `doc-health.json` (`lint/lib/doc-health.cjs`):

  | rule | fixed by |
  |---|---|
  | `jsdoc-summary` (J6) | `bin/codemod-spec/summaries.cjs` (curated `data/descriptions.generated.json`) |
  | `jsdoc-param-description` (J7) | `bin/codemod-spec/param-descriptions.cjs` (reference Fortran `\param` text; option letters translated via `spec/options.json`; strides, offsets, LDs and workspace derived from the spec) |
  | `jsdoc-example-esm` (J8) | `bin/codemod-spec/example-esm.cjs`, `bin/codemod-spec/example-imports.cjs` |

- `spec/options.json`: the Y/N `EQUED` family now also covers
  `laq{sy,sp,sb,he,hp,hb}`, which write `'yes'`/`'none'`. `gen_spec --check`
  is unchanged.
- `npm run docs:examples` runs every JSDoc `@example` as ESM. It fails an
  example that throws, or whose `// returns` / `// x =>` claim is false or
  uncheckable (`{ info: 0, … }`, `<integer>`).

Note: a first pass of this work was lost to a `git reset --hard` on
2026-11-25. It was restored from session checkpoints.

- `@example` repairs: the examples of 52 routines were rewritten to the
  current signatures (S10 length-1 output arrays, caller-owned workspace,
  0-based indices). Every result claim was verified against hand math or the
  reference fixtures. `npm run docs:examples`: 289 run, 246 claims checked,
  0 non-ARPACK failures. One stale claim was a real documentation error:
  `dlamch('epsilon')` is 1.11e-16 in LAPACK 3.12, not 2.22e-16. The repairs
  surfaced ticket 0087.

## Still open

- 16 ARPACK examples fail: they cannot import until ARPACK is in
  `package.json` `exports` (`bin/gen-exports.js` omits it). Whether ARPACK is
  public is an open decision. `dsapps`'s two examples also have a syntax
  error, which the import failure masks.
- 659 routines have no `@example` (J3, warn only). Until both counts are 0,
  `docs:examples` cannot become a gate.
