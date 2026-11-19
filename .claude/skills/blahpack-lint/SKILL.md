---
name: blahpack-lint
description: Run the project lint gate, or add a new lint rule to the lint/ rule library
argument-hint: [path | --fix path | --new <rule-name>]
---

# Linting

Every project rule lives in `lint/`, one self-contained directory per rule.
There is no other rule source: stdlib's internal ESLint rules are not used, and
there are no per-module exemptions (CONVENTIONS T5). `eslint.config.cjs` loads the rules from
`lint/plugin.cjs`, and every configured rule is an error.

## Run the gate

```bash
bin/lint.sh                                   # whole corpus, one ESLint run (~5s)
bin/lint.sh lib/blas/base/daxpy/lib/          # one module
bin/lint.sh --fix lib/blas/base/daxpy/lib/    # apply rule autofixes
npm run test:lint-rules                       # every rule's pass/fail fixtures
node lint/verify-corpus.cjs --list            # per-rule summary of every violation
```

If the user provides `$ARGUMENTS` that is a path, run `bin/lint.sh` on it.
Otherwise lint the path the user is working on, or default to the whole corpus.

Test files (`lib/**/test/**`) are not linted: the pinned ESLint 8.57 cannot
parse their `import ... with { type: 'json' }` import attributes.

## Add a rule

A rule is a directory under `lint/rules/<name>/`:

```
lint/rules/<name>/
  rule.cjs           the ESLint rule
  README.md          what it enforces and why; the subtleties it accommodates
  test.cjs           one line (below)
  fixtures/pass/*.js code the rule must accept
  fixtures/fail/*.js code the rule must reject
```

1. Write `rule.cjs`. Read the file path with
   `context.filename || ( context.getFilename && context.getFilename() ) || ''`
   and the source with `context.sourceCode || context.getSourceCode()` so the
   rule works across ESLint versions. For Fortran facts, use
   `lint/lib/fortran-data.cjs` (the parsed-Fortran cache). Don't parse Fortran
   in a rule.
2. Write fixtures. Each one declares, in line comments at the top:
   - `// target: lib/<pkg>/base/<routine>/lib/<file>.js`: the path the rule
     sees. Rules select files and derive the routine from this path.
   - `// expect: <messageId or message substring>`: fail fixtures only.

   Pin every subtlety the rule accommodates with a pass fixture, and every
   mistake it rejects with a fail fixture.
3. `test.cjs` is:

   ```js
   'use strict';

   require( '../../lib/fixture-test.cjs' )( '<name>', require( './rule.cjs' ), __dirname );
   ```

4. Run `node lint/verify-corpus.cjs --rule <name>` over the whole corpus. A rule
   is enabled in `eslint.config.cjs` (as `'error'`) only once the corpus is
   clean. When a real routine fails, either the rule is missing a genuine
   subtlety (upgrade the rule and add a fixture) or the code is wrong (fix
   the code). Never add an exemption.

If the user asks for a new rule (`$ARGUMENTS` starts with `--new`), scaffold the
directory above.

## Notes

- `.js` files are ESM (`"type": "module"`), so lint tooling uses `.cjs`.
- `bin/lint-fix.sh` (codemods + `eslint --fix` + test verification) predates
  this structure and will be replaced by spec-driven generation; see
  `docs/enforcement-architecture.md`.
