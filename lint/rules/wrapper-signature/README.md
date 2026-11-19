# `wrapper-signature`

**The strided `<routine>.js` wrapper must keep stride/array naming discipline.**

`<routine>.js` is the classic BLAS/LAPACK-style public API. Its exact shape is
the strided projection of `base.js` (CONVENTIONS S4, D1–D3), enforced by
`lint/verify-signatures.cjs`. This rule checks only **stride naming**:

* Every `stride*` parameter must resolve to a real array parameter, using the
  shared naming logic in [`lint/lib/naming.cjs`](../../lib/naming.cjs) —
  including the **shared-stride** form where one stride serves several parallel
  arrays and its suffix concatenates their names (`strideXYZ` over `x`,`y`,`z`;
  `strideCS` over `c`,`s`; motivating routines: `dlar2v`, `dlartv`).
* **No offset requirement** — offsets are computed inside this wrapper, so a
  strided array correctly has `stride<Array>` and no `offset<Array>`
  (`requireOffset = false`).
* `LD*` leading-dimension parameters are **not** naming-checked: they use
  Fortran-native names (`LDAB`, `LDGCOL`, `LDGNUM`) that need not derive from the
  JS array name.

This catches a stride whose array was renamed or dropped.

## Files

| File | Role |
| --- | --- |
| `rule.cjs` | Selects `<routine>.js`, runs the shared naming check with `requireOffset:false`. |
| `fixtures/pass/*.js` | Strided, CBLAS-`order`, and shared-stride forms that must lint clean. |
| `fixtures/fail/*.js` | A dangling stride that must be rejected. |
| `test.cjs` | Runs the rule over every fixture (`node --test`). |

Related: [`fortran-signature`](../fortran-signature/) validates the offset forms
(`base.js`, `ndarray.js`) against the Fortran model. The naming logic is shared
between the two rules via `lint/lib/naming.cjs`.

## Changing the rule

1. Adjust naming logic in `lint/lib/naming.cjs` (shared with `fortran-signature`)
   or the file-selection here.
2. Add a `fixtures/pass` or `fixtures/fail` file pinning the behavior.
3. `node --test lint/rules/wrapper-signature/test.cjs` — fixtures green.
4. `node lint/verify-corpus.cjs` — the whole corpus still exits clean.
