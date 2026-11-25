---
id: 0067
title: The library is untyped JavaScript, so contracts a strict type system would enforce are checked by nothing
status: open
area: typecheck
opened: 2026-11-22
---

## Problem

The library is JavaScript with JSDoc, and the only type check (`npm run typecheck`) is non-strict. It resolves stdlib imports to `any`, types complex arrays and option strings as `any`/`string`, currently fails with 75 errors, and is not in CI (tickets 0003, 0023, 0029). Contracts that a strict type system would enforce structurally are therefore checked by nothing, or by one-off lint rules:

- option-string values;
- the array kind (`Float64Array` vs `Complex128Array` vs `Int32Array`);
- arity and argument order;
- nullability.

## Evidence

Bugs and gaps of this kind already found:

- `dhsein` passed `'infinity'` to `dlanhs`, which accepts `'inf-norm'`. A literal-union parameter type rejects that at compile time. Ticket 0056 tracks the general problem.
- Calls with the wrong number of arguments: ticket 0004.
- Swapped stride, offset and dimension arguments: ticket 0013. Plain `number` cannot catch these; branded index types (`Stride`, `Offset`, `Dim`) can.
- Real/complex array confusion is invisible while `Complex128Array` is `any`: ticket 0023.

- **Measured, 2026-11-25 (ticket 0022):** typing every option as the literal union of its values, under strict `checkJs` with no `.ts` sources, turned up:
  - 684 type errors;
  - two silent wrong-result bugs: dtgsja/ztgsja's validator and dispatch disagreed, and dgges called `dlascl( 'hessenberg', ... )`;
  - five spellings of one dlacpy/dlaset option;
  - a d/z vocabulary split in hsein.

  Each of these had passed every test and lint rule. This is direction step 2's "literal unions for options", done library-wide, and it needed no project-specific check.

A type system would not have caught ticket 0060 (an undersized allocation is a value, not a type).

## Constraints a migration must meet

- **Output:** stdlib-js conformance is about the shipped JS and `docs/types/index.d.ts`. TypeScript sources must therefore emit JS matching the current stdlib conventions, or the published layout changes.
- **Tooling:** every check reads `lib/*.js`: ESLint rules, `conformance`, `spec-*` lint, `break-mutants`, `workspace-guard`, coverage. Each must move to the `.ts` sources or run on emitted JS with source maps.
- **Fixtures and Fortran-facing scripts** (`bin/*.py`) generate and patch JS. They need TS output or a post-emit step.

## Direction

1. Decide the target, either `.ts` sources (annotations mandatory) or strict `checkJs` (annotations optional).
2. Pilot it on one dependency subtree: full strict mode, stdlib type definitions, literal unions for options, and branded index types.
3. Measure what it catches and what each tool needs.
4. Then migrate in waves, with a gate on changed modules.

## Reproduce

```bash
npx tsc -p tsconfig.json 2>&1 | grep -c "error TS"
grep -n '"strict"\|"noImplicitAny"' tsconfig.json
```
