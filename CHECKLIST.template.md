# Module Conformance Checklist

> `CONVENTIONS.md` owns the rules; this checklist only tracks upstreaming
> work for stdlib-js. Where they disagree, CONVENTIONS.md wins.

This checklist tracks what needs to be done to bring a blahpack module
into conformance with stdlib-js contribution standards. Items marked
with [AUTO] can be addressed programmatically; [MANUAL] requires human
review; [GENERATE] means the file should be generated from a template.

## File Structure

- Required file set: CONVENTIONS F1.
- [ ] [AUTO] Remove `LEARNINGS.md` / `LEARNINGS.integrated.md` (not shipped to stdlib)
- [ ] [AUTO] Remove any files not in stdlib convention (e.g., extra scaffold artifacts)

## package.json

- [ ] [AUTO] `"main"` should be `"./lib"` (not `"./lib/index.js"`)
- [ ] [GENERATE] Add `"types": "./docs/types"`
- [ ] [GENERATE] Add `"homepage"`, `"repository"`, `"bugs"` fields
- [ ] [GENERATE] Add `"engines"`, `"os"` fields
- [ ] [GENERATE] Add `"keywords"` array
- [ ] [AUTO] `"scripts"` should be `{}` (not `{"test": ...}`)
- [ ] [GENERATE] Add `"description"` with full mathematical notation

## index.js

- [ ] [MANUAL] `@module` should reference `@stdlib/<pkg>/base/<routine>`
- [ ] [MANUAL] `@example` blocks should show both layout API and `.ndarray()` with
      correct arguments and expected output comments

## base.js

- [ ] [MANUAL] JSDoc `@param` types should use `{NonNegativeInteger}`, `{PositiveInteger}`,
      `{integer}`, `{Float64Array}`, `{Complex128Array}` as appropriate
- [ ] [MANUAL] JSDoc `@param` descriptions should match stdlib verbosity (e.g.,
      "stride of the first dimension of `A` (a.k.a., leading dimension of the matrix `A`)")
- [ ] [MANUAL] `@example` blocks should show realistic usage with expected output
- [ ] [MANUAL] Review algorithm — stdlib may use optimized variants (e.g., blocked
      multiplication, ddot kernels) vs our direct Fortran translation

## ndarray.js (public ndarray API)

- [ ] [MANUAL] JSDoc `@param` descriptions should match stdlib conventions
- Validation, `@example`, `@private`: CONVENTIONS V1–V10, J1–J3

## `<routine>.js` (layout wrapper)

- Signature, `order`, validation, `@throws`: CONVENTIONS S4, D1–D3, V1–V9, J2
- [ ] [MANUAL] For routines with a stdlib reference: compare parameter names
      (e.g. `transA` vs `transa`) and record any difference (S7 keeps Fortran names)

## main.js

- Covered by CONVENTIONS F3.

## README.md

- [ ] [GENERATE] Should document BOTH the layout API and the `.ndarray()` API
- [ ] [GENERATE] Should include mathematical notation in description
- [ ] [GENERATE] Should include parameter tables with types, descriptions
- [ ] [GENERATE] Should include notes about edge cases (quick returns, etc.)
- [ ] [GENERATE] Should include a complete usage example section

## docs/repl.txt

- [ ] [GENERATE] Should document both APIs with parameter descriptions, return values,
      notes, and examples

## Testing

- Test file set and what each exercises: CONVENTIONS F1, T3
- [ ] [GENERATE] Per-scenario JSON fixture files in `test/fixtures/` (not shared JSONL)
- Coverage floor: CONVENTIONS T4

## Signature Conformance

- Signatures are enforced by `sig` and `lint:fortran-signature` (CONVENTIONS S1–S4, D1–D3).
- [ ] [MANUAL] For routines with stdlib reference: verify parameter order matches stdlib

## Notes

- There are no native addons (CONVENTIONS F3).
- Benchmark files should follow the stdlib pattern of testing each parameter combination.
- TypeScript types should use `@stdlib/types/blas` types (`Layout`, `TransposeOperation`,
  `MatrixTriangle`, `DiagonalType`) instead of bare `string`.
