---
id: 0095
title: Test files are not type-checked, and throw tests pass invalid arguments on purpose
status: open
area: tests
opened: 2026-11-25
---

## Problem

`tsconfig.callers.json` (ticket 0094) checks benchmarks and examples against the library's declared types. Tests are left out because applying the same check to them reports thousands of errors, most of them deliberate. A throw test passes `'invalid'` for an option, or a number where an array goes, precisely to see the TypeError. There is no way to mark an argument as intentionally wrong, so `tsc` cannot tell those calls from a test that passes a wrong option by mistake. That mistake makes the test check the wrong branch, or throw before reaching the check it means to test.

## Evidence

- `tsc` with the callers configuration over `lib/*/base/*/test/*.js` (main `807c3a16d`): 12,303 errors in 3,083 files.
  - About 5,800 are missing `node:test`/`node:assert` types (configuration, not bugs).
  - About 1,400 are `routine.ndarray`, which was untyped before ticket 0094.
  - About 1,000 are deliberate `'invalid'` options in throw tests.
  - The rest (array-type and argument-count errors) are unknown: some deliberate, some not.
- Bad arguments in tests found by other means: in the ticket 0092 PR, the dlarft/zlarft/dlarrc throw tests passed `2` for an option, so they threw a TypeError before reaching the RangeError check they meant to test. `bin/codemod-spec/test-flags.cjs` exists to repair that class after the fact.

## Reproduce

```bash
cat > /tmp/ts-test.json <<'J'
{ "extends": "./tsconfig.callers.json", "include": [ "types/jsdoc-aliases.d.ts", "types/callers/globals.d.ts", "lib/*/base/*/lib/*.js", "lib/*/base/*/test/*.js" ] }
J
cp /tmp/ts-test.json ./ts-test.json && npx tsc -p ts-test.json | grep -c 'error TS'; rm ts-test.json
```
