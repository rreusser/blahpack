---
id: 0023
title: The type check runs non-strict and treats complex arrays and option strings as any or string
status: open
area: typecheck
opened: 2026-11-18
---

## Problem

`tsconfig.json` sets `strict: false` and `noImplicitAny: false`, and `types/jsdoc-aliases.d.ts` aliases the stdlib vocabulary loosely:
- `Complex128Array`, `Complex64Array`, `TypedArray`, `NumericArray` and `ndarray` are `any`;
- `TransposeOperation`, `MatrixTriangle`, `OperationSide` and `DiagonalType` are plain `string`.

So the type check cannot tell a real array from a complex one, cannot reject an option value outside the vocabulary, and does not flag reads that may be `undefined`.

The `tsc` sweep and the option-rules work show what stricter types would catch. Once validation narrowed `trans` to a literal union, `tsc` immediately flagged four unreachable `=== 'transpose'` checks (LEARNINGS.md 2026-11-18, option values). Ticket 0003, with stdlib's real declarations loaded, found 19 `Complex128Array`/`Float64Array` mixups that the `any` alias hides.

## Evidence

- `strict: true` produces 3,054 errors: 2,545 `TS18048` (value possibly `undefined`), 451 `TS2345` (argument type) and 58 `TS2322` (assignment type). Most `TS18048` are likely array reads the checker cannot bound; the `TS2345`/`TS2322` group is where real mismatches would be.
- `types/jsdoc-aliases.d.ts` says itself: "Loose for now (Complex types are `any`); tighten as the error count ratchets down." Nothing ratchets it.

## Reproduce

```bash
node -e 'const b=require("./tsconfig.json");Object.assign(b.compilerOptions,{strict:true});require("fs").writeFileSync("tsconfig.probe.json",JSON.stringify(b))' && npx tsc -p tsconfig.probe.json | grep -o 'error TS[0-9]*' | sort | uniq -c | sort -rn; rm -f tsconfig.probe.json
```

## Progress 2026-11-25

- **Done:**
  - `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis`, `useUnknownInCatchVariables` and `alwaysStrict` are on; each had 0 errors.
  - The array aliases are stdlib's real types (`Complex128Array`, `Complex64Array`), and `TypedArray`, `NumericArray` and `BooleanArray` are concrete unions. The option aliases (`MatrixTriangle`, `TransposeOperation`, `OperationSide`, `DiagonalType`, `Layout`) are literal unions. `ndarray` is removed.
  - `lint/typecheck-config.test.cjs` pins all of it, so loosening one fails CI.
- **Found by the tightened array types** (LEARNINGS 2026-11-25, second entry):
  - zlag2c threw on its documented `Complex64Array` output;
  - zlatrz's wrapper allocated a `Float64Array` where base.js needs a `Complex128Array`.
- **Remaining:**
  - **`noImplicitAny`:** 2,675 errors in 64 modules. Mostly `let x;` declarations TS cannot infer (TS7005/7034), `{Object}` parameters with properties (TS2339; ARPACK state objects need a typedef), and `{Array}` without a type argument (TS2314).
  - **`strictNullChecks`:** 3,314 errors in 127 modules. Mostly TS18048, reads of a `let` that some control-flow path may leave unassigned. Each one is either a false alarm from Fortran-style control flow, or a real read of `undefined`, which is NaN silently. Do not blanket-initialise them: that would hide the real ones. Review each one, or find runtime evidence, for example with the harness's poisoned inputs.
  - **Option parameters:** almost all are documented as plain `{string}`, so the literal-union aliases rarely apply. Ticket 0056 tracks using them.
  - **Complex scalars:** `Complex128`/`Complex64` are still `any` (ticket 0085).

## Progress 2026-11-25 (noImplicitAny)

`noImplicitAny` is on and pinned in `lint/typecheck-config.test.cjs`. It had 2,675 errors in 64 modules. `bin/codemod-implicit-any.mjs` fixed nearly all of them from the type checker's own inference:
- variables: the union of their assigned types, split into one annotated `let` each;
- private-helper parameters: types from the call sites, descriptions from same-named parameters (the remaining 74 were written by hand);
- helper `@returns {Object}`: the object shape;
- ARPACK state: a `@typedef` per routine. The `spec-jsdoc` lint accepts a same-file `@typedef {Object}` for a state parameter.

About ten were fixed by hand. `strictNullChecks` remains (3,314 errors in 127 modules; see above).
