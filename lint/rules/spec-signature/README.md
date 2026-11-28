# `spec-signature`

**The parameter lists of `base.js`, `strided.js` and `<routine>.js` equal the
projections of `spec/<routine>.json`.**

The projections live in [`lint/lib/spec.cjs`](../../lib/spec.cjs) and are the
same lists `bin/spec show <routine>` prints:

| File | Projection | Conventions |
| --- | --- | --- |
| `base.js`, `strided.js` | offset form: arrays expand to `x, strideX, offsetX` / `A, strideA1, strideA2, offsetA`, complex outputs and `element` scalars to `x, offsetX`, LD/INC/LWORK/INFO dropped | S1–S3, S5, S10, W2 |
| `<routine>.js` | wrapper form: matrices `A, LDA`, vectors `x, strideX`, packed and workspace arrays without a stride, no offsets, `order` first iff a non-workspace matrix is taken | S4, D1–D3, D5c |

Names compare case-insensitively (S7). A spec's `jsOrder` (set only by an
override, with its reason) reorders the JS parameters; nothing else bends a
projection.

A module with no spec is an error (`noSpec`): run `bin/gen_spec <routine>`.

Supersedes `fortran-signature`, `wrapper-signature` and
`lint/verify-signatures.cjs` (`signature-conformance`).

## Fixtures

- `pass/`: the current `dgetrs` forms.
- `fail/`: a renamed parameter, a wrapper without `order`, a module with no spec.
