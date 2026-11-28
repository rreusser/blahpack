# `jsdoc-summary`

**The JSDoc of a module's exported function (`base.js`, `strided.js`,
`<routine>.js`) opens with a complete summary sentence. So does the module
JSDoc in `lib/index.js`, when there is one.** The API reference (`bin/docs`)
uses the first sentence as the routine's summary in listings, search,
`llms.txt` and page titles.

Rejected:

- no description, or an exported function with no JSDoc;
- an `@license` tag in a function's JSDoc. Scaffolding left these in place of
  the summary; the license belongs in the file header;
- a summary that ends mid-statement: `Performs one of the matrix-matrix
  operations:.` (the formula that followed was lost in translation);
- a scaffold placeholder (`TODO`, `FIXME`, `TBD`);
- a summary that is not a sentence ending in `.`, `!` or `?`.

Not checked: a sentence that is grammatical but cut short, such as "…of a
complex." followed by "Hermitian matrix A." on the next line. No syntactic
check can catch that.

Fix: `node bin/codemod-spec/summaries.cjs [routine ...]` uses the curated
one-liner in `data/descriptions.generated.json`
(`node bin/gen-descriptions.js --print <routine>`).

The predicate lives in [`lint/lib/doc-health.cjs`](../../lib/doc-health.cjs).
