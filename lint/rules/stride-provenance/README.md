# `stride-provenance`

`base.js` computes every element index from the array's offset and passes callees the array's own strides and offset (CONVENTIONS S13).

**Files:** `base.js` whose signature matches its spec (`spec-signature` reports the rest)

Every value in `base.js` is tagged with the parameters it's computed from:
transitively through local variables, `reinterpret()` views (including a view
reassigned to several arrays) and local helper functions. Then:

- **P1** `A[ i ]` must be computed from `offsetA`.
- **P3** When `A` is passed to a callee with a spec (an import of
  `…/<routine>/lib/{base,ndarray}.js`, or a recursive call), the callee's spec
  (`lint/lib/spec.cjs` `baseGroups`) says which following arguments are `A`'s
  strides and offset.
  - Each stride argument must be computed from a stride of `A`. Never a
    literal (`literalStride`), never only another array's (`foreignStride`).
  - The offset argument must be computed from `offsetA` (`foreignOffset`).

A literal stride is rejected even where it is harmless (the column stride of
an N×1 view, a length-1 vector). Passing the array's own stride costs nothing
and keeps the rule free of exemptions.

**Autofix:** for an array with a single stride (1-D), the offending argument is
replaced by that stride, since there is only one right answer. For a 2-D array,
which stride the callee walks is a translation judgment: compare with the
Fortran (`X(1,K), 1` → `strideX1`; `X(K,1), LDX` → `strideX2`).

**Sound by construction:** tags merge flow-insensitively, which can only
over-approximate dependencies. Reusing a variable for two arrays can hide a
violation but never invent one.

**Not covered yet:**
- **P2:** an access mixing two arrays' strides. It needs the
  one-index-variable-per-array convention to be precise.
- Calls into routines without a spec.
- Workspace arrays: unit stride by contract (D5b); their offsets belong to
  `workspace-addressing-honored`.

The dynamic counterpart is `test/harness/spec-layout.js`: it re-runs a valid
call under other layouts and compares the results.

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/stride-provenance/test.cjs`.
