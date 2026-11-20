# `lint/` — the blahpack lint library

A single, coherent library of lint rules that enforce the Fortran→JavaScript
translation conventions (owned by [`CONVENTIONS.md`](../CONVENTIONS.md)). Each rule is a **self-contained directory** — its
implementation, its specification, and its worked examples all live together —
so a rule reads as one artifact you can understand end to end, not a fragment
scattered across a `bin/` of scripts and a config file.

## Principles

1. **One rule, one directory.** `lint/rules/<name>/` holds the rule
   (`rule.cjs`), its spec (`README.md`), pass/fail fixtures (`fixtures/`), and
   its own test (`test.cjs`). Adding a rule means adding a directory; `plugin.cjs`
   discovers it, and `eslint.config.cjs` enables it.

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
  verify-no-escape-hatches.cjs ← rejects baselines/allowlists/skips (`hatch`)
  no-fortran-source.test.cjs   ← CI never reads vendored Fortran (T6)
  lib/
    fortran-data.cjs           ← loads parsed Fortran argument metadata
    spec.cjs                   ← spec/<routine>.json + the three signature projections (S1–S4)
    spec-target.cjs            ← which spec and form a linted file is
    prologue.cjs               ← the generated validation prologue (V1, V3–V8)
    jsdoc-spec.cjs             ← the @param/@throws/@returns a spec implies
    fixture-test.cjs           ← shared fixture runner for rule tests
    require-eslint.cjs         ← resolves eslint locally or globally
  rules/
    spec-signature/            ← the three signatures equal the spec projections
    spec-prologue/             ← ndarray.js / <routine>.js prologue equals the generated one
    spec-messages/             ← prologue error messages are the canonical ones
    spec-jsdoc/                ← @param / @throws / @returns agree with the spec
      README.md  rule.cjs  fixtures/{pass,fail}/*.js  test.cjs
    module-exports/            ← index.js/main.js expose the default + ndarray surface
      README.md  rule.cjs  fixtures/{pass,fail}/*.js  test.cjs
    <name>/                    ← every other rule, same shape
```

## Commands

```bash
# Run one rule's fixtures
node --test lint/rules/spec-signature/test.cjs

# The gate: run all rules over the whole corpus (must exit 0)
node lint/verify-corpus.cjs
node lint/verify-corpus.cjs --list          # every failing file + message
node lint/verify-corpus.cjs --rule spec-signature
```

The library is wired into the project ESLint config (`eslint.config.cjs`) under
the `blahpack/` namespace, so the rules also run as part of normal linting.

## Rules

The `spec-*` rules compare every signature-bearing file of a module (`base.js`,
`ndarray.js`, `<routine>.js`) with what [`spec/<routine>.json`](../spec/README.md)
plus CONVENTIONS.md produce — exact, derived, no heuristics. `module-exports`
covers `index.js`/`main.js`; the rest enforce the workspace strategy and catch
scaffolding/convention defects:

| Rule | Files | Enforces |
| --- | --- | --- |
| [`spec-signature`](rules/spec-signature/) | `base.js`, `ndarray.js`, `<routine>.js` | Parameter lists equal the spec projections (`bin/spec show`; CONVENTIONS S1–S5, S7, S10, D1–D3, D5c, W2). |
| [`spec-prologue`](rules/spec-prologue/) | `ndarray.js`, `<routine>.js` | The validation prologue is the generated one: one check per reference `INFO = -k` check, in reference order (V1, V3–V7). Fix: `bin/codemod-spec/prologue.cjs`. |
| [`spec-messages`](rules/spec-messages/) | `ndarray.js`, `<routine>.js` | Each prologue error carries its canonical message (V8). |
| [`spec-jsdoc`](rules/spec-jsdoc/) | `base.js`, `ndarray.js`, `<routine>.js` | `@param` / `@throws` / `@returns` agree with the spec (J2, C1, S11). Fix: `bin/codemod-spec/jsdoc.cjs`. |
| [`module-exports`](rules/module-exports/) | `index.js`, `main.js` | The module exposes both entry points — the strided default and its `ndarray` variant. |
| [`no-internal-workspace-alloc`](rules/no-internal-workspace-alloc/) | `base.js`, `ndarray.js` | No problem-sized workspace allocation when the Fortran declares a caller-provided workspace; the caller owns it. |
| [`no-lwork-param`](rules/no-lwork-param/) | all | No workspace-length parameter; a typed array carries its own `.length`. |
| [`workspace-addressing-honored`](rules/workspace-addressing-honored/) | `base.js`, `ndarray.js` | CONVENTIONS D5a/D5b (workspace offset honored; stride rejected unless honored). |
| [`z-prefix-reinterpret`](rules/z-prefix-reinterpret/) | z-prefix `base.js` | Float64 views of complex arrays come from `reinterpret()`. |
| [`no-dprefix-conjugate-transpose`](rules/no-dprefix-conjugate-transpose/) | d-prefix files | No `'conjugate-transpose'` in real routines. |
| [`jsdoc-backtick-params`](rules/jsdoc-backtick-params/) | all | Single-char Fortran flags in `@param` are backtick-quoted. |
| [`no-stub-wrappers`](rules/no-stub-wrappers/) | all but `base.js` | No "not yet implemented" scaffolding stubs. |
| [`no-todo-params`](rules/no-todo-params/) | all | No `TODO` scaffolding in `@param` descriptions or types. |
| [`stride-provenance`](rules/stride-provenance/) | `base.js` | Element indices use the array's offset; callees get the array's own strides and offset (S13). Autofixes 1-D arrays. |
| [`no-nary-stdlib-minmax`](rules/no-nary-stdlib-minmax/) | all | stdlib `max`/`min` take exactly two args. |

New rules' tests are one line calling the shared fixture runner,
[`lib/fixture-test.cjs`](lib/fixture-test.cjs): fixtures declare their virtual
path with `// target:` and, for failures, the expected report with `// expect:`.
(`module-exports` predates it and carries its own `test.cjs`.)

**No escape hatches.** Every lint rule is a hard CI gate at `error`; there is no
baseline, known-failures list, or `continue-on-error` (CONVENTIONS T5).
`lint/verify-no-escape-hatches.cjs` fails CI, loudly, if one is introduced.

_The checks under `bin/conformance` are candidates to migrate into this
structure, one self-contained rule at a time._
