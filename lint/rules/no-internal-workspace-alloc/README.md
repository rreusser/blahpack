# `no-internal-workspace-alloc`

Disallow internal workspace-array allocation in base.js (the caller must own the buffer).

**Files:** `base.js`, `ndarray.js`

When the reference Fortran declares a caller-provided workspace array
(`WORK`/`RWORK`/`IWORK`/`SWORK`/`BWORK`, read from `data/fortran-signatures.json`
via `lib/fortran-data.cjs`), or the JS already exposes a workspace parameter,
the offset-form files must not allocate a problem-sized typed array. The caller
owns the buffer; only `<routine>.js` may allocate it, and only when
`work === null`.

Accommodated, since none of these are workspace:
- fixed-size allocations (`new Float64Array( 2 )`, `new Float64Array( [ a, b ] )`)
- buffer views (`new Float64Array( x.buffer, ... )`)
- the block-reflector `T` factor (`T`, `T2`, ...)

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-internal-workspace-alloc/test.cjs`.
