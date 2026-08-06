# Signature conventions

The authority for what every module's function signatures must be. The process
for maintaining it is fixed and has no escape hatch:

1. **Define** the convention here.
2. **Check** it systematically (a rule in `lint/rules/`, exact — no flexibility).
3. **Conform** every routine that can be conformed mechanically.
4. **Isolate** the routines that cannot, and make an explicit decision about each
   — recorded in this file. A routine is never silently exempted; it is either
   conformed or listed below as an open decision with an owner.

## The three forms

A module declares its routine in three places. They are not independent — two of
them are *exact projections* of the third:

```
                 Fortran signature  (data/fortran-signatures.json)
                        │  authority
                        ▼
                    base.js          ← the offset form; anchored to Fortran by
                        │              the fortran-signature rule
          ┌─────────────┴─────────────┐
          ▼                           ▼
     ndarray.js                  <routine>.js
   (≡ base.js, exact)      (≡ strided projection of base.js, exact)
```

* **`base.js`** — the offset form: every array expands to
  `arr, strideArr, offsetArr` (1-D) or `arr, strideArr1, strideArr2, offsetArr`
  (2-D). This is the authority; the `fortran-signature` rule checks it against
  the parsed Fortran.
* **`ndarray.js`** — the public ndarray API. Its parameter list **must equal
  `base.js`'s, exactly.** No renames, no added or dropped parameters.
* **`<routine>.js`** — the strided BLAS/LAPACK-style API. Its parameter list
  **must equal the strided projection of `base.js`, exactly** (defined below).

`main.js` and `index.js` carry no parameter list; their export surface is
governed by the `module-exports` rule.

## The strided projection (`base.js` → `<routine>.js`)

A deterministic transform of the offset-form parameter list:

| base.js (offset form) | `<routine>.js` (strided) |
| --- | --- |
| 1-D array `arr, strideArr, offsetArr` | `arr, strideArr` (offset dropped) |
| 2-D array `arr, strideArr1, strideArr2, offsetArr` | `arr, LD<ARR>` (strides+offset → one leading dim) |
| complex scalar `arr, offsetArr` | `arr` (offset dropped) |
| scalar / dimension / character | unchanged |

Plus one prepended parameter governed by an **open decision** (see below):
`order`.

## Ratified conventions

* **`ndarray.js` ≡ `base.js`** (exact). *Check: to be added.*
* **Scalar names are canonical, everywhere.** `DA → alpha`, `DB → beta`. A file
  using the Fortran spelling is nonconforming. *(Conformed: `dscal` base.js
  `da → alpha`.)*
* **The strided projection is exact** for the array/offset/leading-dim mapping in
  the table above.

## Resolved conventions — deferred to stdlib

The strided-form conventions are **stdlib's**, read from stdlib source
(`@stdlib/blas/base/*` locally; `@stdlib/lapack/base/*` via the published
mirrors, e.g. `dlaswp`). Where the current code contradicts itself, stdlib
breaks the tie; there is no wiggle room.

The two forms have distinct, principled jobs:

* **ndarray form** (`base.js`/`ndarray.js`) — full indexing: every array carries
  `stride…, offset…`; matrices carry `strideA1, strideA2, offsetA`; **no
  `order`** (two strides already encode row/col-major). `dlaswp.ndarray`:
  `N, A, strideA1, strideA2, offsetA, k1, k2, …, IPIV, strideIPIV, offsetIPIV`.
* **strided form** (`<routine>.js`) — the BLAS/LAPACK-classic API: strides but
  no offsets (the offset is computed internally via `stride2offset`), and a
  single `LDA` for matrices with an `order` flag. `dlaswp`:
  `order, N, A, LDA, k1, k2, IPIV, strideIPIV`.

### D1 — `order` (RESOLVED: stdlib)

`order` appears **only in the strided form**, and only when the routine takes a
matrix passed by leading dimension (`LDA`). It never appears in the ndarray
form. (stdlib maintained routines `dgemm`/`dgemv`/`dtrmv` confirm; `dlaswp`
confirms for LAPACK.)

### D2 — strides in the strided form (RESOLVED: stdlib + workspace ruling)

In the strided form:
* data vectors and index arrays → keep a stride (`dlaswp` strides `IPIV`),
* 2-D / banded matrices → `LDA` (no strides),
* **packed matrices → no stride** (just the array — a contiguous triangle),
  and they still take `order` (`dspmv` → `order, uplo, N, alpha, AP, x,
  strideX, …`). Identified by packed storage code (`sp`/`hp`/`tp`/`pp`) + a
  `…P` matrix name.
* **workspace arrays → no stride** (just the array). stdlib has no work-array
  routine to defer to, so this is ruled here: a stride on caller-owned scratch
  is not meaningful.

The convention is expressed in two places kept in lock-step — the generator
(`bin/gen_wrapper.py`) and the checker (`lint/lib/strided-projection.cjs`) — and
`lint/verify-generator.cjs` asserts they agree on every routine (`npm run
lint:generator`), so a generated wrapper always passes the lint rule.

### D3 — offsets in the strided form (RESOLVED: stdlib)

The strided form has **no `offset*` parameters** — the offset is computed
internally. Offsets are necessary for full ndarray indexing and live in the
ndarray form, which keeps them.

### D4 — workspace exposure in `base.js`

`base.js` must not allocate a problem-sized workspace (existing
`no-internal-workspace-alloc` rule); the caller owns it. But `dporfs` and
`zhetrf` expose `WORK`/`IWORK` in `ndarray.js` and **not** in `base.js`, so
`base.js` must be allocating internally.

**Isolated — pending decision:** `dporfs`, `zhetrf`. Conforming means threading
the workspace parameters through `base.js` (semantic, per-routine).

## Conformance status

Run the exact checks over the corpus with `node lint/verify-corpus.cjs`. Current
standing against the (as-yet-unratified) projection:

* `ndarray.js ≡ base.js`: 863 conform, **2 isolated** (`dporfs`, `zhetrf` — D4),
  1 conformed (`dscal`), 46 base-only (no ndarray.js).
* `<routine>.js ≡ strided projection`: 437 conform; **429 pending** the D1–D3
  rulings, after which the residue is genuine per-routine work.

No routine is exempt. Every entry above is either conformed or a named open
decision.
