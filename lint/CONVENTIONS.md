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
                 Fortran signature  (data/routines.json + supplemental.json)
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

## Open decisions

These cannot be derived from the code because **the code contradicts itself** —
so they must be ruled on, then enforced. Evidence is from the current corpus.

### D1 — `order` parameter

Does the strided `<routine>.js` form take a leading `order` (row/col-major)
parameter, and for which routines? The current code is inconsistent *within a
single storage class*:

| storage | has `order` | no `order` |
| --- | --- | --- |
| `ge` (general) | 67 | 28 |
| `sy` (symmetric) | 29 | 23 |
| `po` (posdef) | 13 | 7 |
| `pb` (posdef band) | 9 | 9 |

Two general-matrix routines with identical storage disagree. There is no rule to
recover — it is drift.

**Recommendation:** `order` is present iff the routine takes a matrix argument
(any 2-D, packed, or banded array); absent for pure vector routines. This is the
stdlib CBLAS/LAPACKE convention. Enforcing it conforms ≈200 wrappers (adding or
removing `order`), all public-signature changes.

### D2 — stride retention in the strided form

Does `<routine>.js` keep a stride for every array, or drop strides on some?
Current code disagrees: `dgeqrf.js` keeps `strideTAU`, `strideWork`; `dgbrfs.js`
drops strides on `IPIV`, `FERR`, `BERR`, `WORK`, `IWORK`. ~170 wrappers drop at
least one stride the projection keeps.

**Recommendation:** keep a stride for every array (the projection above). Drop
nothing. Conforming restores the dropped `stride*` parameters.

### D3 — offsets in the strided form

44 `<routine>.js` files still carry `offset*` parameters (e.g. `dzasum`,
`dhsein`). The strided form computes offsets internally and must not expose them.

**Recommendation:** drop all `offset*` from `<routine>.js`. Conforming removes
them.

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
