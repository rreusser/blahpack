# `lint/` — the blahpack lint library

A single, coherent library of lint rules that enforce the Fortran→JavaScript
translation conventions. Each rule is a **self-contained directory** — its
implementation, its specification, and its worked examples all live together —
so a rule reads as one artifact you can understand end to end, not a fragment
scattered across a `bin/` of scripts and a config file.

## Principles

1. **One rule, one directory.** `lint/rules/<name>/` holds the rule
   (`rule.cjs`), its spec (`README.md`), pass/fail fixtures (`fixtures/`), and
   its own test (`test.cjs`). Adding a rule means adding a directory; there is
   no central registry to edit beyond listing it in `plugin.cjs`.

2. **No exemptions.** There is deliberately no configuration file, allowlist, or
   per-module suppression mechanism. The previous conformance setup accreted a
   de-facto waiver file that let violations be silenced en masse — that is
   exactly what this structure removes. When a real routine fails a rule, the
   answer is one of two things, never a third:
   - the rule is missing a genuine subtlety → **upgrade the rule** (and pin the
     subtlety with a fixture), or
   - the code is genuinely wrong → **fix the code**.

   "Add it to the ignore list" is not available.

3. **Every rule is proven against the whole corpus.** A rule is not done when it
   passes a handful of fixtures; it is done when it exits clean over all ~900
   translated `base.js` files. `node lint/verify-corpus.cjs` is that gate.

4. **Fixtures are first-class.** Each accommodated subtlety and each rejected
   mistake is a real `.js` file under `fixtures/`, so the rule's behavior is
   legible from examples, not just from prose.

## Layout

```
lint/
  README.md                    ← this file
  plugin.cjs                   ← assembles rules/*/rule.cjs into an ESLint plugin
  verify-corpus.cjs            ← runs every rule over all lib/**/base.js (the gate)
  lib/
    fortran-data.cjs           ← loads parsed Fortran argument metadata
    require-eslint.cjs          ← resolves eslint locally or globally
  rules/
    fortran-signature/         ← rule #1: base.js params must expand the Fortran signature
      README.md
      rule.cjs
      derive.cjs
      data/{supplemental.json,build-supplemental.cjs}
      fixtures/{pass,fail}/*.js
      test.cjs
```

## Commands

```bash
# Run one rule's fixtures
node --test lint/rules/fortran-signature/test.cjs

# The gate: run all rules over the whole corpus (must exit 0)
node lint/verify-corpus.cjs
node lint/verify-corpus.cjs --list          # every failing file + message
node lint/verify-corpus.cjs --rule fortran-signature
```

The library is wired into the project ESLint config (`eslint.config.cjs`) under
the `blahpack/` namespace, so the rules also run as part of normal linting.

## Rules

| Rule | Enforces |
| --- | --- |
| [`fortran-signature`](rules/fortran-signature/) | `base.js` parameter lists faithfully expand the reference Fortran signature (computed from the parsed Fortran, checked against the JS). |

_This is the seed of the library. Existing ad-hoc checks under `bin/conformance`
and `tools/eslint/rules` are candidates to migrate into this structure, one
self-contained rule at a time._
