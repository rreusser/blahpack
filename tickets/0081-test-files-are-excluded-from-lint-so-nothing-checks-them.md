---
id: 0081
title: Test files are excluded from lint, so nothing checks them
status: open
area: lint
opened: 2026-11-23
---

## Problem

`eslint.config.cjs` ignores `lib/**/test/**` (and `test/**`), and `npm run test:lint` is `bin/lint.sh`, which lints module sources only. Test files therefore get no lint at all: no unused imports, no parse check of the test syntax, and none of the T2/T5 rules that lint could enforce in tests. Problems accumulate unseen.

## Evidence

- `eslint.config.cjs` `ignores`: `'test/**'` and `'lib/**/test/**'`.
- `bin/lint.sh lib/lapack/base/zgelss/test/` reports every file ignored. Running eslint with `--no-ignore` on the same files reports:
  - a parse error on the JSON import `with { type: 'json' }` clause (the parser predates import attributes);
  - an unknown rule `stdlib/first-unit-test`;
  - an unused `Int32Array` in `test.zgelss.js`.

  Reported by a wave-3 agent.

## Reproduce

```bash
grep -n "test/\*\*" eslint.config.cjs
```

## Direction

Add a test-file lint configuration (with a parser that accepts import attributes), and gate it on changed modules first.

## Evidence 2026-11-27 (ticket 0093 PR)

- The value-mutant survey found 11 test files whose comparisons pass on NaN: `if ( Math.abs( a - b ) > tol ) { fail }` is false for NaN. In zsyr this made the fixture tests pass on an all-NaN A. The helpers were in dlamswlq, dlamtsqr, dorgtsqr, zhetrd_he2hb, zhetrs, zsyr, zsytf2 and zsytrf, and the inline checks in dlarft, dlarfy and dlarzt. All now use `!( … <= tol )`. With test files unlinted, nothing stops a new one; a lint rule for the pattern belongs with this ticket.

## Evidence 2026-11-27 (test lint PR)

Test files are now linted: `eslint.config.cjs` has a block for `lib/**/test/**/*.js` and `test/harness/**/*.{js,mjs}` (`test/harness/fixtures/**` excluded: verbatim copies of old module files). It is parsed by espree 10.4.0 (a pinned devDependency) because ESLint 8.57's espree 9 stops at ES2024 and cannot parse `with { type: 'json' }`. `bin/lint.sh` (`npm run lint`, `npm run test:lint`, CI's lint job) lints `lib/` and `test/harness/`.

Counts over 3,099 module test files plus 25 harness files, with the test rule set:

| Rule | Before | After |
| --- | --- | --- |
| parse errors | 0 | 0 |
| `no-undef` | 0 (once `process` and `URL` are declared globals) | 0 |
| `no-unused-vars` (args ignored) | 222 in 176 files | 0 |
| `no-self-compare` (`x !== x` NaN tests) | 61 in 52 files | 0 |
| `blahpack/no-nan-blind-comparison` (new; CONVENTIONS T2a) | 22 in 21 files | 0 |
| unknown rule in an `eslint-disable` directive (`stdlib/*`, `node/no-sync`) | 2,866 in 2,613 files | 0 |
| `no-dupe-keys`, `no-unreachable`, `no-dupe-args`, `no-duplicate-case`, `no-func-assign`, `use-isnan`, `valid-typeof` | 0 | 0 |

The second unused-vars pass found 35 more (fixture imports and harness names used only by the removed dead code), also fixed. All 22,285 unit tests pass. No fixed comparison exposed a NaN result. The harness's `assertZeroBlock` was blind to a NaN `scale`; it is fixed with a regression test and a LEARNINGS entry.

I think this ticket can be resolved: every test file is linted in CI and the corpus is clean.
