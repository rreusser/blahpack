# `spec-jsdoc`

**The JSDoc of the exported function of `base.js`, `ndarray.js` and
`<routine>.js` agrees with the spec** ([`lint/lib/jsdoc-spec.cjs`](../../lib/jsdoc-spec.cjs);
CONVENTIONS J2, C1, C4, S10, S11):

- **`@param`**: one per parameter, in order, named as the code names it, with
  the type the spec implies:

  | Parameter | Type |
  | --- | --- |
  | array (matrix, banded, packed, vector, index, workspace, output scalar) | by dtype: `Float64Array`, `Complex128Array`, `Int32Array`, `Uint8Array` (logical), `Float32Array`, `Complex64Array`; an output option (EQUED) `Array` |
  | wrapper workspace | `(Float64Array\|null)` etc. (D5c) |
  | stride | `integer` |
  | offset, dimension | `NonNegativeInteger` |
  | leading dimension | `PositiveInteger` |
  | option, `order` | `string` |
  | input scalar | `number`, `integer`, `boolean`, `Complex128`, `Function` |

- **`@throws`** (`ndarray.js`, `<routine>.js`): the leading `@throws` tags are
  the generated prologue's, one per check, in order
  (`{TypeError} first argument must be a valid order`). Further `@throws`
  (workspace checks) may follow.
- **`@returns`**: `integer` for INFO, the value type of a FUNCTION, the array
  type of the primary output array (S11); no `@returns` when nothing is
  returned.

Fix: `node bin/codemod-spec/jsdoc.cjs [routine ...]` (keeps descriptions;
borrows a missing one from the module's other forms).
