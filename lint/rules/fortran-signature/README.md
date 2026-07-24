# `fortran-signature`

**Every translated routine's `base.js` parameter list must be a faithful
expansion of its reference Fortran signature.**

The signature is not hand-maintained and it is not asserted against itself — it
is *computed* from the Fortran, and the actual JavaScript is checked against
that computation. This is the rule that keeps 900+ machine-and-hand translations
from drifting away from the sources they came from.

```
Fortran source ──fparser (bin/extract_metadata.py)──▶ data/routines.json
                                                            │
                    lint/rules/fortran-signature/data/supplemental.json
                                                            │
                                                            ▼
                                     derive.cjs  (Fortran args → signature model)
                                                            │
                                              rule.cjs  (compare to base.js)
```

## Files

| File | Role |
| --- | --- |
| `rule.cjs` | The ESLint rule. Resolves the routine, computes the model, checks the actual signature. |
| `derive.cjs` | Pure function: Fortran argument list → expected-signature model. All classification logic lives here and is unit-testable in isolation. |
| `data/supplemental.json` | Reference Fortran signatures for routines not vendored in `data/` (ARPACK family + a few others). |
| `data/build-supplemental.cjs` | Authoring script that emits `supplemental.json` from transcribed reference signatures. |
| `fixtures/pass/*.js` | Signatures that must lint clean — one per accommodated subtlety. |
| `fixtures/fail/*.js` | Signatures that must be rejected — each declares the `messageId` it triggers. |
| `test.cjs` | Runs the rule over every fixture (`node --test`). |

The whole-corpus gate lives one level up: `node lint/verify-corpus.cjs` runs this
rule over all ~900 real `base.js` files and must exit clean.

## What is computed

`derive.cjs` maps each Fortran dummy argument to a **slot** carrying the *set*
of JavaScript parameter counts it may occupy. Some Fortran argument classes have
exactly one faithful JS form (rigid); others have several. The rule then checks:

1. **Arity** — the actual parameter count must be one the slots can sum to.
2. **Naming discipline** — every `stride*`/`offset*` parameter must refer to a
   real array parameter under the `stride<Array>` / `offset<Array>` convention
   (`stride<Array>1` / `stride<Array>2` for a 2D array). Checked by referential
   integrity on the actual list, so it holds even when flexible classes make
   absolute positions ambiguous.

### The base expansion rules

| Fortran argument | JavaScript | Count |
| --- | --- | --- |
| 2D array `A` + `LDA` | `A, strideA1, strideA2, offsetA` | 4 (rigid) |
| 1D data array `x` | `x, strideX, offsetX` | 3 (rigid) |
| `CHARACTER` / integer dim (`N`,`M`,`K`) | passthrough scalar | 1 |
| real/integer scalar (`in`) | passthrough value | 1 |
| `LDA`, `LDAB`, … (leading dim) | consumed (replaced by strides) | 0 |
| `INFO` | consumed (returned) | 0–1 |

## Accommodated subtleties

Each row is a real property of the corpus, encoded in `derive.cjs`/`rule.cjs`,
and pinned by a passing fixture. **When a routine fails this rule the response is
to understand the subtlety and encode it here — never to exempt the routine.**
There is no exemption mechanism.

| Subtlety | Why | Fixture |
| --- | --- | --- |
| **Complex vector keeps its precision prefix** — array `zx`/`cy`, stride `strideX`/`offsetY`. | A complex vector is passed as a reinterpreted typed array retaining its Fortran name; the stride/offset use the logical, prefix-stripped name. | `pass/zaxpy--complex-prefix.js` |
| **Digit-suffixed separate 1D arrays** — `VN1`/`VN2`, `TAUP1`/`TAUP2`, `X1`/`X2`. | These are *distinct* 1D arrays, not the two dimensions of one 2D array. Exact array-name match is tried before 2D digit-grouping. | `pass/dlaqp2--digit-suffixed-1d-arrays.js` |
| **2D dimension strides** — `stride<A>1` + `stride<A>2`. | Recognized as one 2D array only when *both* sibling strides are present. | `pass/dgemm--2d-matrices.js` |
| **Stride-name collision** — 2D `Q` claims `strideQ2`, so 1D `Q2` becomes `strideQ21` (its sole dimension), keeping `offsetQ2`. | When a 1D array's canonical stride name is already taken by another array's dimension, a trailing `1` disambiguates. Fires only on a genuine collision. | `pass/dlaed2--stride-name-collision.js` |
| **Output-scalar packing** — `DROTG(DA,DB,C,S)` → `ab,strideAB,offsetAB, cs,strideCS,offsetCS`. | A by-value JS parameter cannot return a written scalar, so `out`/`inout` scalars are packed into caller arrays (or a result object). These slots are count-flexible. | `pass/drotg--scalar-packing.js` |
| **Complex function return** — `COMPLEX*16 FUNCTION ZLADIV(X,Y)` gains an `out,offsetOut`. | A complex result is not a single JS number, so it is surfaced through an added output parameter with no Fortran counterpart. | `pass/zladiv--complex-return.js` |
| **Workspace arrays** — `WORK`, `RWORK`, `IWORK`. | Allocated internally and elided, or kept as `arr,offset` / `arr,stride,offset` / a 2D workspace. Count-flexible. | (exercised across the corpus, e.g. dgeqrf) |
| **Increment kept** — a rare routine keeps `INCX` for its sign semantics (e.g. `DLASWP`). | `INC*` is normally replaced by a stride, but not always; allowed to be kept. | (corpus) |
| **Workspace size kept** — ARPACK keeps `LWORKL`. | `L*WORK` sizes are normally implicit in the typed array's length, but some routines keep them. | `pass/dsaupd--reverse-communication-state.js` |
| **Reverse-communication state** — any routine with an `IDO` argument gains a leading `state` object. | ARPACK's reverse-communication protocol persists progress in Fortran `SAVE` variables; JS has no `SAVE`, so state is threaded explicitly. | `pass/dsaupd--reverse-communication-state.js` |

## Coverage and the `noData` failure

A routine with no ingested Fortran arguments is reported as a **loud coverage
gap** (`noData`), not skipped. Its signature simply cannot be computed. The fix
is to add the reference Fortran signature to `supplemental.json` (re-run
`build-supplemental.cjs`) — the same faithful derivation then applies. Ingesting
a routine's Fortran is *extending coverage*; it is categorically different from
exempting a routine from a check it fails.

`fixtures/fail/ztheta--no-fortran-data.js` pins this behavior.

## Changing the rule

1. Add or adjust a classification in `derive.cjs` (or a naming case in
   `rule.cjs`).
2. Add a `fixtures/pass` or `fixtures/fail` file pinning the behavior, and a row
   in the table above.
3. `node --test lint/rules/fortran-signature/test.cjs` — fixtures green.
4. `node lint/verify-corpus.cjs` — the whole corpus still exits clean.
