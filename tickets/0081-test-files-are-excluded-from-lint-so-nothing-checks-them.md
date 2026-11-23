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
