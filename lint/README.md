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
  verify-corpus.cjs            ← runs every rule over all module files (the gate)
  lib/
    fortran-data.cjs           ← loads parsed Fortran argument metadata
    naming.cjs                 ← shared stride/offset naming-discipline check
    require-eslint.cjs          ← resolves eslint locally or globally
  rules/
    fortran-signature/         ← base.js + ndarray.js params expand the Fortran signature
      README.md  rule.cjs  derive.cjs
      fixtures/{pass,fail}/*.js  test.cjs
      (reads data/fortran-signatures.json — the clean cache from
       bin/gen_fortran_signatures.js; Fortran facts only)
    wrapper-signature/         ← <routine>.js strided wrapper keeps stride naming discipline
      README.md  rule.cjs  fixtures/{pass,fail}/*.js  test.cjs
    module-exports/            ← index.js/main.js expose the default + ndarray surface
      README.md  rule.cjs  fixtures/{pass,fail}/*.js  test.cjs
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

The first three validate every signature-bearing file of a module (`base.js`,
`ndarray.js`, `<routine>.js`, `index.js`, `main.js`); the rest enforce the
workspace strategy and catch scaffolding/convention defects:

| Rule | Files | Enforces |
| --- | --- | --- |
| [`fortran-signature`](rules/fortran-signature/) | `base.js`, `ndarray.js` | The offset-form parameter list faithfully expands the reference Fortran signature (computed from the parsed Fortran, checked against the JS). |
| [`wrapper-signature`](rules/wrapper-signature/) | `<routine>.js` | The strided wrapper keeps stride/array naming discipline (offsets computed internally; shared strides and Fortran-native `LD*` names accommodated). |
| [`module-exports`](rules/module-exports/) | `index.js`, `main.js` | The module exposes both entry points — the strided default and its `ndarray` variant. |
| [`no-internal-workspace-alloc`](rules/no-internal-workspace-alloc/) | `base.js`, `ndarray.js` | No problem-sized workspace allocation when the Fortran declares a caller-provided workspace; the caller owns it. |
| [`no-lwork-param`](rules/no-lwork-param/) | all | No workspace-length parameter; a typed array carries its own `.length`. |
| [`workspace-addressing-honored`](rules/workspace-addressing-honored/) | `base.js` | A caller-owned workspace that is used must be addressed through its declared offset and stride. |
| [`z-prefix-reinterpret`](rules/z-prefix-reinterpret/) | z-prefix `base.js` | Float64 views of complex arrays come from `reinterpret()`. |
| [`no-dprefix-conjugate-transpose`](rules/no-dprefix-conjugate-transpose/) | d-prefix files | No `'conjugate-transpose'` in real routines. |
| [`jsdoc-backtick-params`](rules/jsdoc-backtick-params/) | all | Single-char Fortran flags in `@param` are backtick-quoted. |
| [`no-stub-wrappers`](rules/no-stub-wrappers/) | all but `base.js` | No "not yet implemented" scaffolding stubs. |
| [`no-todo-params`](rules/no-todo-params/) | all | No `TODO` scaffolding in `@param` descriptions or types. |

The offset-form naming logic is shared between `fortran-signature` and
`wrapper-signature` via [`lib/naming.cjs`](lib/naming.cjs).

New rules' tests are one line calling the shared fixture runner,
[`lib/fixture-test.cjs`](lib/fixture-test.cjs): fixtures declare their virtual
path with `// target:` and, for failures, the expected report with `// expect:`.
(The first three rules predate it and carry their own `test.cjs`.)

**Workspace strides (decided 2026-11-17): keep and enforce.** `base.js`/`ndarray.js`
keep `strideX` on caller-owned workspace and must honor it
(`workspace-addressing-honored`); the strided `<routine>.js` form takes none (D2).

**No escape hatches.** Every check is a hard CI gate; there is no baseline,
known-failures list, `continue-on-error`, or `'warn'` level.
`lint/verify-no-escape-hatches.cjs` fails CI, loudly, if one is introduced.

_The checks under `bin/conformance` are candidates to migrate into this
structure, one self-contained rule at a time._
