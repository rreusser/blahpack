---
id: 0116
title: Benchmark and example files are not linted, only type-checked
status: open
area: lint
opened: 2026-11-27
---

## Problem

`lib/**/benchmark/**` and `lib/**/examples/**` are ignored by `eslint.config.cjs`. They are only type-checked by `typecheck:callers`, so unused imports, undefined names outside the type checker's view, and NaN-blind comparisons there go unchecked. The test-file lint added for ticket 0081 shows what such a pass finds: 222 unused bindings and 22 NaN-blind comparisons in tests.

## Evidence

- `eslint.config.cjs`: the source block ignores `lib/**/benchmark/**` and `lib/**/examples/**`; the test block covers only `lib/**/test/**` and `test/harness/**`.
- `bin/lint.sh` with no arguments lints `lib/` and `test/harness/`; benchmark and example files under `lib/` are skipped by the ignores.

## Reproduce

```bash
grep -n "lib/\*\*/benchmark\|lib/\*\*/examples" eslint.config.cjs
npx eslint lib/blas/base/daxpy/benchmark/*.js 2>&1 | tail -2   # "File ignored because of a matching ignore pattern"
```

## Direction

Extend the test-file configuration (correctness rules only: parse, no-undef, no-unused-vars, no-unreachable) to benchmarks and examples, measure, fix, and gate.
