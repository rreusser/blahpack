# `module-exports`

**Every module must expose both entry points: the layout-form default and its
`ndarray` (offset-form) variant.**

`index.js` declares no parameter list of its own: it is the plumbing that
defines how the module is consumed. Its "signature" is the export surface, and a
module missing either entry point is a broken public API. There is no
`main.js`; its attachment was folded into `index.js` (ticket 0124,
`bin/codemod-fold-main.mjs`). This rule enforces, on `lib/index.js`:

| Requirement | Form |
| --- | --- |
| Attach the offset form | `setReadOnly( <routine>, 'ndarray', ndarray );` |
| Typed default export | `export default /** @type {typeof <routine> & { ndarray: typeof ndarray }} */ ( <routine> );` `tsc` cannot see a property a call adds, so without the type no caller's `<routine>.ndarray( … )` is checked (ticket 0094). |
| Named export | `export { ndarray };` |

```js
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import ndarray from './ndarray.js';

setReadOnly( ddot, 'ndarray', ndarray );

export default /** @type {typeof ddot & { ndarray: typeof ndarray }} */ ( ddot );
export { ndarray };
```

## Files

| File | Role |
| --- | --- |
| `rule.cjs` | AST checks over the `index.js` export surface. |
| `fixtures/pass/*.js` | The canonical `index.js`. |
| `fixtures/fail/*.js` | No attachment, an untyped default, no named `ndarray`, and the retired re-export of `main.js`. |
| `test.cjs` | Runs the rule over every fixture (`node --test`). |

## Changing the rule

1. Adjust the export-surface checks in `rule.cjs`.
2. Add a `fixtures/pass` or `fixtures/fail` file pinning the behavior.
3. `node --test lint/rules/module-exports/test.cjs` — fixtures green.
4. `node lint/verify-corpus.cjs` — the whole corpus still exits clean.
