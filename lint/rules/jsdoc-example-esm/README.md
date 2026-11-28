# `jsdoc-example-esm`

**`@example` code in module sources uses ESM `import`, never CommonJS
`require`.** The package is `"type": "module"`, so a `require` example fails
for anyone who copies it. The API reference shows examples verbatim. Examples
scaffolded from stdlib used `var x = require( '@stdlib/…' )`.

Subtlety: doctrine silently drops **every** tag of a comment whose `@module`
names a scoped package (`@module @stdlib/lapack/base/ddisna`), which hid these
examples entirely. `lint/lib/doc-health.cjs#parse` strips the inner `@` first;
`fixtures/fail/require.js` pins it.

Fix: `node bin/codemod-spec/example-esm.cjs`. It rewrites
`var f = require( '@stdlib/array/float64' );` to
`import Float64Array from '@stdlib/array/float64/lib/index.js';`, and a
require of one of our routines to its public import path
(`@rreusser/blahpack/<pkg>/<routine>`). Then
`node bin/codemod-spec/example-imports.cjs` makes each example import the
routine it calls.

The predicate lives in [`lint/lib/doc-health.cjs`](../../lib/doc-health.cjs).
