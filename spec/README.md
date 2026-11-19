# spec/: per-routine specs

One JSON file per routine, `spec/<routine>.json`, **generated from the reference
Fortran** (`docs/enforcement-architecture.md` §3). The spec states each
routine's parameters, roles, dtypes, intents, shapes, argument checks, quick
returns, return value and workspace sizes. The JS signatures are *projections*
of it (CONVENTIONS S1–S4, D1–D3, D5c, W2), computed in `lint/lib/spec.cjs`.
Don't edit specs by hand. Regenerate them, or add an override.

Shape: [`schema.json`](schema.json) (validated by `lint/spec-schema.test.cjs`).

## Pipeline

```
Fortran sources (gitignored)
   │  bin/gen_spec --extract        developer-time only (CONVENTIONS T6)
   ▼
data/fortran-checks.json            committed: INFO checks, quick returns, locals,
data/fortran-signatures.json        declarations, doc constraints; arguments/intents/types
spec/options.json                   Appendix A as data: option letter → canonical string
spec/overrides/<routine>.json       hand overrides, each with a reason
   │  bin/gen_spec                  pure function of the committed inputs
   ▼
spec/<routine>.json                 committed; `bin/gen_spec --check` in CI
```

```bash
bin/gen_spec                 # regenerate all (modules with lib/**/base.js + existing specs)
bin/gen_spec dgetrf          # one routine; also creates the spec for a new routine
bin/gen_spec --check         # CI: fail if any spec differs from regeneration
bin/gen_spec --extract       # refresh data/fortran-checks.json (needs `npm run fetch-reference`)
bin/spec show dgetrf         # the spec and its three signatures
bin/spec xcheck [--list]     # compare every spec projection with the code
```

## What the generator derives (and from where)

| Field | Source |
|---|---|
| argument order | the `SUBROUTINE` statement (the doc-derived cache is sometimes out of order or incomplete) |
| `dtype`, `intent` | doc comment `\param[in,out]` and declared type |
| `dims` | rank from the declaration (`A( LDA, * )`), extents from the doc comment |
| `role` | the declaration plus the argument's LD/INC links: rank 2 is `matrix` (`banded` in gb/sb/hb/pb/tb routines whose LD constraint isn't `max(1,·)`); `N*(N+1)/2` with a `…P` name is `packed` (`rfp` in pf/sf/hf/tf); `[A-Z]?WORK…` is `workspace`; INTEGER 1-D is `index`; an INTEGER input checked `< 0`, documented `>= 0`, used in an extent, or quick-returned on `= 0` is `dim` |
| `ld` / `inc` link | the array whose first extent is `LDx`; the array whose extent uses `INCx`, else the array argument just before it |
| `rows` | the LD check (`LDA < max(1, M)` → `M`), else the LD doc constraint |
| `checks` | `INFO = -k` (BLAS: `INFO = k`) before XERBLA, outside loops, with enclosing IF guards. Kinds are `nonnegative`, `ld`, `nonzero` and `enum` (accepted letters found by three-valued evaluation over the locals), plus `expr` for everything else. LWORK checks become the workspace `minLength` (W1). |
| `minLength` | the LWORK check, else the LWORK doc constraint, else the declared extent |
| `quickReturn` | top-level `IF( c ) RETURN` / `IF( c ) THEN … RETURN` after the checks |
| `returns` | S11 |
| `name` | Fortran name, with these canonical aliases: `DA→alpha`, `DB→beta`, `DX/SX→x`, `DY/SY→y`, `DPARAM→param` (unless the alias collides); in/out `INFO` → `infoIn`. Casing is cosmetic; names compare case-insensitively (S7). |

Expressions carry `fortran` (verbatim) and `js` (locals and constants inlined;
helpers `max`, `min`, `abs`, `trunc`, `real`, `imag`). When an expression
leaves the grammar (data-dependent locals, `ILAENV`-driven sizes, doc
pseudo-variables like `KA`), `js` is `null` and the reason is listed in
`untranslated`. Nothing is guessed. Facts the generator can't derive go in
`notes` (for example, an option family missing from Appendix A).

## Overrides

`spec/overrides/<routine>.json`:

```json
{ "routine": "dlaswp",
  "overrides": [ { "reason": "…why the generated fact is wrong…", "set": { "params.INCX.role": "scalar" } } ] }
```

Paths are `params.<Fortran or JS name>.<key>`, `checks.<info>.<key>`, or a
top-level key; `null` deletes. Applied overrides, with their reasons, are copied
into the spec. These are errors: a missing reason, an override that changes
nothing (stale), and an override for a routine with no spec (orphan).
**An override category that repeats is a generator bug.** Fix the generator
instead.
