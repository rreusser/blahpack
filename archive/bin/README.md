# Archived Scripts

These are one-time migration scripts whose work has already been applied across the codebase.
They are kept for reference but are no longer part of the active pipeline.

| Script | Purpose | Status |
|--------|---------|--------|
| `add_license.py` | Add Apache-2.0 license headers | Applied to all files |
| `convert_strings.py` | Convert single-char Fortran flags to long-form | Applied codebase-wide |
| `convert_eslint.py` | Convert ESLint config format | Applied |
| `fix_jsdoc_lint.py` | Fix JSDoc formatting | Now caught by ESLint rules |
| `fix_bad_fortran_formatting.py` | Fortran reformatting | Subsumed by `bin/transform.py` |
| `gen_learnings.py` | Generate LEARNINGS.md templates | `bin/scaffold.py` handles new modules |
| `jats_to_markdown.py` | Convert JATS XML references | Unrelated to BLAS/LAPACK pipeline |

## One-shot fixups and codemods (archived 2026-07)

Applied codebase-wide during the translation push and no longer wired into any
live pipeline (`bin/gate.js`, `bin/lint-fix.sh`, the skills, or CI). Kept for
reference. The live codemods (`bin/codemod-tests.js`, `bin/codemod-index.js`)
remain in `bin/`.

| Script | Purpose |
|--------|---------|
| `codemod-dedup-imports.js` | Remove duplicate import statements |
| `codemod-hoist-vars.js` | Hoist variable declarations to the top of scope |
| `codemod-ld-validation.js` | Add leading-dimension validation |
| `codemod-minwork-zero.js` | Normalize zero-size workspace handling |
| `codemod-remove-unused-imports.js` | Strip unused imports |
| `codemod-routine-validation.js` | Add routine-argument validation |
| `codemod-split-tests.js` | Split combined test files |
| `codemod-stride-checks.js` | Add stride validation |
| `codemod-string-validation.js` | Add string-argument validation |
| `codemod-work-autoalloc.js` | Auto-allocate workspace arrays |
| `codemod-fix-broken-minwork.js` | Repair minWork syntax from `codemod-work-autoalloc` |
| `add-throws-tags.js` | Add `@throws` JSDoc tags |
| `add_validation.py` | Insert validation blocks |
| `conform-index-js.js` | Conform `index.js` to house style |
| `conform-package-json.js` | Conform per-module `package.json` |
| `conform-test-fixtures.js` | Conform test fixture format |
| `split-fixtures.js` | Split fixture JSON files |
| `fix-index-example.py` | Fix `index.js` examples |
| `fix-readme-todos.py` | Fill README TODO placeholders |
| `fix-scaffold-noise.py` | Remove scaffold noise |
| `fix-single-char-examples.py` | Replace single-char flags in examples |
| `fix_mixed_operators.py` | Parenthesize mixed operators |
| `fix-workspace.py` / `audit-workspace.py` | Audit and fix workspace handling |
| `gate-triage.py` | One-off gate-failure triage helper |
