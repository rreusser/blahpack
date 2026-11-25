# `jsdoc-param-description`

**Every `@param` on a module's exported function (`base.js`, `ndarray.js`,
`<routine>.js`) describes the parameter. A description that only repeats the
parameter's name fails** (`@param {NonNegativeInteger} N - N`). Ticket 0002
counted 2,225 of these. The API reference (`bin/docs`) prints the description
verbatim, so a placeholder there leaves a reader with nothing.

Subtleties:

- The comparison ignores case, backticks, quotes and punctuation, so
  `` `LDA` `` and `lda.` both count as the name.
- An empty description fails too.
- A line comment between the JSDoc and the function does not hide the JSDoc.

Fix: `node bin/codemod-spec/param-descriptions.cjs [routine ...]`. It takes the
first sentence of the reference Fortran's `\param` block, translating option
letters to their JS strings via `spec/options.json`. For strides, offsets and
leading dimensions it uses the array they address, and for workspace the
spec's minimum length.

The predicate lives in [`lint/lib/doc-health.cjs`](../../lib/doc-health.cjs).
The documentation site's `doc-health.json` uses the same predicate.
