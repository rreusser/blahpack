---
name: blahpack-lint
description: Run ESLint with stdlib rules, fork rules for customization, or create new fixable rules
argument-hint: [path | --fix path | --fork <rule-name> | --new <rule-name>]
---

# ESLint Setup

Blahpack uses a **copy-on-write** ESLint setup. All 122 stdlib rules load from
the stdlib checkout by default. When a rule needs modification, it gets forked
locally into `tools/eslint/rules/` where it takes priority.

## Lint and fix

The primary workflow is `bin/lint-fix.sh` which runs the full pipeline:
codemods → eslint --fix → test verification → rollback if broken.

```bash
# Fix one module (codemods + eslint --fix + test verify):
bin/lint-fix.sh lib/blas/base/daxpy

# Fix all modules:
bin/lint-fix.sh

# Just lint (no fixes):
bin/lint.sh lib/blas/base/daxpy/lib/base.js
bin/lint.sh                                      # all modules (batched)

# Just eslint --fix (no codemods):
bin/lint.sh --fix lib/blas/base/daxpy/lib/
```

If the user provides `$ARGUMENTS`, run `bin/lint-fix.sh` on those paths.
Otherwise lint the path the user is working on or default to `lib/`.

## Fork a stdlib rule for customization

```bash
bin/fork-eslint-rule.sh <rule-name>
```

This copies the rule to `tools/eslint/rules/<name>.cjs`, rewrites `@stdlib/*`
imports to `tools/eslint/shims.cjs`, and copies companion files (e.g.
`defaults.json`). The local copy immediately overrides the stdlib version.

If the user asks to fork a rule (`$ARGUMENTS` starts with `--fork`), run the
fork script with the rule name.

## Create a new fixable rule

To create a brand-new rule with `--fix` support:

1. Create `tools/eslint/rules/<name>.cjs` following this template:

```js
'use strict';

var rule = {
    'meta': {
        'docs': {
            'description': 'description of what the rule checks'
        },
        'schema': [],
        'fixable': 'code'  // enables --fix
    },
    'create': function main( context ) {
        return {
            // AST visitor methods
            'CallExpression': function validate( node ) {
                context.report({
                    node: node,
                    message: 'Error message',
                    fix: function( fixer ) {
                        return fixer.replaceText( node, 'replacement' );
                    }
                });
            }
        };
    }
};

module.exports = rule;
```

2. Enable the rule in `tools/eslint/config/blahpack.json`:

```json
{
    "stdlib/<name>": "error"
}
```

If the user asks to create a new rule (`$ARGUMENTS` starts with `--new`),
scaffold the rule file and add the config entry.

## Codemods

The `bin/lint-fix.sh` pipeline runs these codemods before eslint --fix:

| Script | Transforms |
|--------|-----------|
| `bin/codemod-tests.js` | Var hoisting with toposort, Array.from→toArray, require-globals, JSDoc for helpers, section headers, func-names, eslint-disable headers |
| `bin/codemod-index.js` | use-strict insertion, empty lines, emphasis markers |

Codemods are safe to re-run (idempotent) and never break tests.
ESLint --fix is applied per-file with automatic test verification and
rollback if anything breaks.

## Key files

| File | Purpose |
|------|---------|
| `bin/lint-fix.sh` | Full pipeline: codemods + eslint --fix + test verify |
| `bin/codemod-tests.js` | Test file codemod (var hoisting, Array.from, JSDoc) |
| `bin/codemod-index.js` | Index.js codemod (use strict, emphasis, empty lines) |
| `eslint.config.cjs` | Flat config (active): blahpack rules + core correctness rules over ESM `lib/` sources |
| `tools/eslint/plugin.cjs` | Plugin loader: local rules + optional stdlib rules via `STDLIB_ESLINT_DIR` |
| `tools/eslint/shims.cjs` | Drop-in replacements for @stdlib utilities |
| `tools/eslint/find-jsdoc.cjs` | JSDoc comment locator (used by 72+ rules) |
| `tools/eslint/config/*.json` | Rule severity configs (from stdlib + blahpack overrides) |
| `tools/eslint/config/blahpack.json` | Blahpack-specific overrides and custom rule config |
| `tools/eslint/rules/` | Locally forked or new rules (.cjs files) |
| `bin/fork-eslint-rule.sh` | Script to fork a stdlib rule locally |

## Notes

- All `.js` files in this project are ESM (`"type": "module"` in package.json),
  so ESLint tooling files use `.cjs` extension for CommonJS.
- One stdlib rule (`jsdoc-markdown-remark`) is disabled due to a remark version
  incompatibility when loaded cross-project.
- Linting uses ESLint's flat config (`eslint.config.cjs`) via the pinned local
  binary; `bin/lint.sh` sets `ESLINT_USE_FLAT_CONFIG=true` and batches per
  module to avoid EMFILE. The blahpack rules load from `tools/eslint/plugin.cjs`.
- stdlib's own ESLint rules are not on npm; they load only when
  `STDLIB_ESLINT_DIR` points at a stdlib checkout. Without it, the blahpack
  rules (the ones that enforce this project's conventions) plus core
  correctness rules still run.
