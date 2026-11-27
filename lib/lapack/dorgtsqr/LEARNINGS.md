# dorgtsqr: Translation Learnings

## Translation pitfalls

- **`MB > N` constraint** — unlike most LAPACK routines, `dorgtsqr` requires `MB > N` strictly (not `>=`). This is because `MB - N` is the row count of each non-leading TSQR block, and `MB <= N` would degenerate `dlatsqr` into a single `dgeqrt` (same partitioning logic appears in `dlatsqr`/`dlamtsqr`).
- **`NBLOCAL = MIN(NB, N)` clamping** — Fortran clamps `nb` internally before passing to `dlamtsqr`. We replicate this so callers passing `nb > N` (legal in the wrapper) don't trip a `dlamtsqr` precondition.
- **WORK partitioning matches Fortran exactly** — the first `M*N` doubles hold a column-major scratch matrix `C` (initialized to identity, overwritten with `Q1`); the trailing `N*nblocal` doubles are the `dlamtsqr` workspace. We surface `(M+nb)*N` as the recommended size in the wrapper docs (matches LAPACK `LWORK`).
- **`dlaset` `'F'` → `'all'`** — the Fortran call passes `'F'` (full matrix); the JS convention canonicalised to `'all'` (anything except `'upper'`/`'lower'` works, but `'all'` is the project's chosen long form).

## Dependency interface surprises

- **`dlamtsqr` takes both C and WORK** — when calling with `side='left'`, dlamtsqr's WORK must be at least `N*nb` doubles. We pass our scratch slice (`oc + ldc*N` onward) directly, avoiding double allocation.
- **`dlaset` ndarray signature** — `dlaset( uplo, M, N, alpha, beta, A, sa1, sa2, oA )` — the *off-diagonal* value comes before the diagonal value. Easy to flip; matches Fortran but visually unintuitive.

## Coverage / testing notes

- All branches of `dorgtsqr` are reachable with simple `(M, N, mb, nb)` combinations; no special-case rescaling paths to worry about. 100% line and branch coverage on `base.js` with the 7 fixture-driven test cases plus 2 quick-return cases.
- Tests run `dlatsqr` in JS to produce reflectors before calling `dorgtsqr`, then compare both `Q` and `Q^T*Q` against the Fortran fixture. This validates the full `dlatsqr` → `dorgtsqr` pipeline end-to-end.
- For testing, `dlatsqr.base` requires `nb <= N`; `dorgtsqr` accepts `nb > N` (clamped). The "nb > N" test case factors with `nb=N` then calls `dorgtsqr` with `nb=5` to exercise the clamping branch.

## Doctest gotcha

- `index.js` `@example` blocks are *executed* by `stdlib/jsdoc-doctest` against the stdlib node_modules tree. Requiring a sibling module like `@stdlib/lapack/base/dlatsqr` fails when that module is not yet present in the install. Workaround: use `require( './../lib' )` for self-reference and avoid cross-module requires in the `@example` block; refer to dependencies in prose comments instead.
