# Contributing

## Setup

```bash
npm ci                     # JS dependencies
npm run fetch-reference    # BLAS/LAPACK reference Fortran sources into data/
```

`npm run fetch-reference` downloads the reference BLAS 3.12.0 and LAPACK
3.12.0 sources (gitignored, upstream-owned) into `data/`. They are
required to regenerate test fixtures and to run the gate's
workspace-family checks; without them those checks skip.

### Python tooling

The translation pipeline (`bin/*.py`) needs Python with `fparser`:

```bash
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

## Everyday commands

```bash
npm test                          # full suite (exits non-zero on failure)
node bin/gate.js <module-path>    # quality gate for one module
node bin/gate.js --all --fast     # fast gate over all modules
npm run lint                      # eslint (stdlib + local rules)
npm run gen-exports               # regenerate index.js + package.json (run after adding a module)
```

Generated files (`index.js`, `package.json` `exports`/`files`) are
produced by `bin/gen-exports.js` and verified in CI — run
`npm run gen-exports` and commit the result whenever you add or remove a
module.

See `CLAUDE.md` for the full translation workflow and conventions.
