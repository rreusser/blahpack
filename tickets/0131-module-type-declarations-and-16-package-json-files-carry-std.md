---
id: 0131
title: Module type declarations and 16 package.json files carry stdlib's license and authorship, not this project's
status: open
area: conventions
opened: 2026-11-27
---

## Problem

Files copied from stdlib's package template kept stdlib's license header and
authorship. Each module's source says `@license MIT`, "Copyright (c) 2026
Ricky Reusser", but its type declarations say `@license Apache-2.0`,
"Copyright (c) 2025 The Stdlib Authors". Sixteen module `package.json` files
also give stdlib's author, contributors, homepage, repository, bugs URL and
Apache-2.0 license. A reader, or a licence scanner, gets two contradictory
answers about who wrote the code and under what licence.

The project is diverging from stdlib (decided 2026-11-27): it is no longer
meant to flow into stdlib unmodified, so its files should credit this
project, as the sources already do. Derived-from notices for the reference
implementations (LAPACK, BLAS, ARPACK) stay.

## Evidence

- `docs/types/index.d.ts` and `docs/types/test.ts` of every module (915 of
  each) say `@license Apache-2.0` and "Copyright (c) 2025 The Stdlib Authors";
  none say MIT.
- `package.json` of the 13 ARPACK modules and 3 LAPACK modules: author and
  contributors "The Stdlib Authors", `license` Apache-2.0, homepage,
  repository and bugs pointing at stdlib-js/stdlib. The other 899 say MIT
  and Ricky Reusser.
- `benchmark/benchmark.js` and `benchmark.ndarray.js` of dgetv0, dsaitr,
  dsaup2, dsaupd and dsband credit The Stdlib Authors.
- Those 16 `name` fields were `@stdlib/<pkg>/base/<routine>`; the layout
  flatten (ticket 0125) recomputes every module name, which fixes them.
- `bin/scaffold.py` writes the stdlib author and Apache-2.0 license into
  generated files, so new modules repeat the problem.

## Reproduce

```bash
git grep -l "The Stdlib Authors" -- lib | sed -E 's#^lib/[a-z]+/(base/)?[^/]+/##' | sort | uniq -c
```
