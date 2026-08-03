# `module-exports`

**Every module must expose both entry points: the strided default and its
`ndarray` variant.**

`main.js` and `index.js` declare no parameter list of their own — they are the
plumbing that defines how the module is consumed. Their "signature" is the export
surface, and a module that is missing either entry point is a broken public API.
This rule enforces:

| File | Contract |
| --- | --- |
| `main.js` | Attaches the ndarray variant to the routine (`setReadOnly( <routine>, 'ndarray', ndarray )`, or `<routine>.ndarray = ndarray`) **and** exports it as the default. |
| `index.js` | Exports a `default` (the strided entry point) **and** exposes `ndarray` — either as a named `ndarray` export (the common form) or by re-exporting `main.js`'s default, which already carries `.ndarray`. |

Both index.js forms are accepted because both leave `ndarray` reachable:

```js
// canonical
export { default } from './main.js';
export { default as ndarray } from './ndarray.js';

// variant — default carries `.ndarray` (attached in main.js)
import main from './main.js';
export default main;
```

## Files

| File | Role |
| --- | --- |
| `rule.cjs` | AST checks over `main.js` and `index.js` export surfaces. |
| `fixtures/pass/*.js` | Canonical + variant index.js, and a well-formed main.js. |
| `fixtures/fail/*.js` | index.js missing ndarray; main.js missing the ndarray attach. |
| `test.cjs` | Runs the rule over every fixture (`node --test`). |

## Changing the rule

1. Adjust the export-surface checks in `rule.cjs`.
2. Add a `fixtures/pass` or `fixtures/fail` file pinning the behavior.
3. `node --test lint/rules/module-exports/test.cjs` — fixtures green.
4. `node lint/verify-corpus.cjs` — the whole corpus still exits clean.
