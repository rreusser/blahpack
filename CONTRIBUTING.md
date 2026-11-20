# Contributing

## Setup

```bash
npm ci                     # JS dependencies
npm run fetch-reference    # BLAS/LAPACK reference Fortran sources into data/
```

`npm run fetch-reference` downloads the reference BLAS 3.12.0, LAPACK
3.12.0, and arpack-ng 3.9.1 sources (gitignored, upstream-owned) into
`data/`. They are required to regenerate test fixtures and the committed
caches (`data/fortran-signatures.json` etc.). CI and the gates read only those
caches, never the sources (CONVENTIONS T6).

### Python tooling

The translation pipeline (`bin/*.py`) needs Python with `fparser`:

```bash
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

## Everyday commands

```bash
npm test                          # unit tests + lint (exits non-zero on failure)
npm run test:unit                 # unit tests only
npm run test:lint                 # lint only
node bin/conformance.js <module-path>    # conformance check for one module
node bin/conformance.js --all --fast     # fast conformance over all modules
npm run lint                      # eslint (lint/ rules only)
npm run gen-exports               # regenerate index.js + package.json (run after adding a module)
```

Generated files (`index.js`, `package.json` `exports`/`files`) are
produced by `bin/gen-exports.js` and verified in CI — run
`npm run gen-exports` and commit the result whenever you add or remove a
module.

Conventions: `CONVENTIONS.md`. Translation workflow: `CLAUDE.md`.
