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
