---
id: 0085
title: zrot's base takes its sine as a Float64Array pair, not the spec's complex scalar, so the Complex128 alias stays any
status: open
area: typecheck
opened: 2026-11-25
---

## Problem

The spec, and therefore the JSDoc that `lint:spec-jsdoc` enforces, says zrot's `s` is a complex scalar (`{Complex128}`). But `lib/lapack/base/zrot/lib/base.js` reads `s[ 0 ]` and `s[ 1 ]`: it takes a length-2 `Float64Array`, and its 79 internal call sites pass `zlartg`'s output pairs (`sn`, `sScratch`, `szArr`, ...) in about 20 modules. So the code and its enforced documentation disagree. The lint forces the JSDoc to describe an interface the code does not have.

With the `Complex128` alias tightened to stdlib's type, these 79 calls are type errors. `types/jsdoc-aliases.d.ts` therefore keeps `Complex128` and `Complex64` as `any`, so every complex-scalar mix-up stays invisible to the type check.

The tightened alias also reports 17 uses of `Complex128Array.get()` results, typed `Complex128 | void` by stdlib, in zlabrd, zlahr2, zlaqr5, zlarfg, zlarfgp and zlatrd. These need the reinterpret-view pattern used in zpbtrf and zunbdb2 (ticket 0023).

## Evidence

- `lib/lapack/base/zrot/lib/base.js:34`: `@param {Complex128} s - sine of rotation as an [re, im] pair`. The code reads `s[ 0 ]` and `s[ 1 ]`.
- Setting `type Complex128 = import( '@stdlib/types/complex' ).Complex128` in `types/jsdoc-aliases.d.ts` gives:
  - 81 errors, all calls into zrot;
  - 17 `.get()` errors;
  - 8 errors where stdlib's interface type and its ctor class type differ (zlaic1, zlarfy, zrscl, ztfsm), so the alias should name the ctor class.

## Reproduce

```bash
sed -i "s/^type Complex128 = any;/type Complex128 = import( '@stdlib\/types\/complex' ).Complex128;/" types/jsdoc-aliases.d.ts && npx tsc -p tsconfig.json | grep -c 'error TS'; git checkout types/jsdoc-aliases.d.ts
```

## Direction

- Give zrot's base the S10 element form: `s, offsetS` on a `Complex128Array`, with a spec override marking `element` and its reason, as for zlarf's `tau`.
- Move the callers' `Float64Array` pairs to one-element `Complex128Array` scratch, which zlartg's complex output is written into.
- Replace `.get()` reads with reinterpret views.
- Then alias `Complex128`/`Complex64` to the ctor classes, and drop their exemption in `lint/typecheck-config.test.cjs`.

## Evidence 2026-11-25 (ticket 0094)

With `Complex128 = any`, `tsc -p tsconfig.callers.json` accepted a plain number passed as zspr's `alpha`. The ticket 0094 caller-fix agents found complex scalars passed as numbers or `Float64Array`s in several examples (zspr, zgerc, zgeru, zgemm, zgemv, zhemm, …). Only the runtime caught them, and only where an example threw.
