# dorbdb5: Translation Learnings

## Translation pitfalls

- `signature.py` again emitted both `strideX1, offsetX1, incx1` (and
  analogously for X2) even though the Fortran already carries `INCX1`.
  This is the same scaffold gap noted in dorbdb6's LEARNINGS — the JS
  signature should consume `INCX*` into `strideX*` and drop the
  redundant slot. Worth fixing in `bin/signature.py` so that future
  routines with `INCX`-style increments don't keep tripping this.
- The Fortran `LWORK` parameter is dropped in JS (workspace is
  caller-supplied with stride/offset), matching dorbdb6.
- `DLAMCH('Precision')` → `Number.EPSILON` (= `@stdlib/constants/float64/eps`).
  Distinct from `DLAMCH('E')` which is `EPSILON/2`. The "Fortran Idioms"
  table in SKILL.md should grow a row for `'P'` to make this obvious.
- The "X is exactly zero" entry path is easy to miss when planning tests.
  The first quick-return condition `norm > N*EPS` fails for a literally
  zero X *and* for X with subnormal norm, both of which fall through to
  the standard-basis search. Cover both cases.

## Dependency interface surprises

- `dlassq` returns an object `{scl, sumsq}` chained across calls — same
  pattern reused from dorbdb6. The `norm2` helper is essentially copied
  from dorbdb6.
- `dnrm2(N, x, stride, offset)` (no LWORK), and `dscal(N, alpha, x, stride, offset)`
  — straightforward BLAS-style signatures, no surprises.
- `dorbdb6` is invoked here as the projection kernel (one call in the
  fast path, one per loop iteration in the basis-search paths). Its
  return value (the `info` integer) is intentionally discarded by the
  Fortran (`CHILDINFO`) — we mirror that.

## Coverage gaps

- Hit 100% line and 100% branch coverage on `base.js`. The X2 search
  loop's "found a basis vector" return branch is exercised by the
  `zero_x_finds_e_first_in_x2` case, where Q spans the X1 partition.
- The `tiny_x_falls_through_to_basis_search` case (X norm < N*eps with
  X != 0) is critical for covering the edge where the first
  quick-return branch is skipped but X1 isn't zero on entry — without
  it, `norm > N*EPS` evaluates the same as the literal-zero case but
  the input pre-state to the basis-search loop differs.

## Test-design notes

- Sister-routine pattern reuse paid off: lifted `buildQ`,
  `assertArrayClose`, layout-invariance and offset-honored test
  helpers nearly verbatim from dorbdb6's `test.ndarray.js`. These are
  small enough not to merit extraction yet, but a third routine in this
  family would warrant a shared `test/_helpers.js`.
- Fortran fixture cases are nine, with one extra JS-only case for
  `m1=0, m2=0, n=0` (a trivial path that doesn't survive Fortran's
  argument validation). Pattern carries over from dorbdb6.

## Process improvements

- `init_routine.py`'s scaffold still emits `test/test.<routine>.js`
  with arity inferred from the raw `signature.py` output (which
  includes the redundant `incx*` slots). Expected wrapper arity for
  dorbdb5 is 14, scaffold guessed 16. Recommend either dropping
  `incx*` from signature.py before counting, or surfacing the choice
  in init output. (Same gap dorbdb6 flagged — still unfixed.)
- `gen_test.py` produced a high-quality scaffold for `test.ndarray.js`
  this time around, including data-driven `findCase` lookup. The
  inputs (Q layouts, X buffers, WORK sizes) still needed to be
  hand-reconstructed from the Fortran test source — the fixture only
  records *outputs*. Embedding inputs in the fixture (or in a
  parallel `_inputs.jsonl`) would close the loop.
- Benchmark scaffold reproduces the dorbdb6 OOM trap (originally
  N*N=10^12 doubles for N=10^6). Replaced with `M=len, N=min(len, 16)`
  per the dorbdb6 pattern. The scaffold should know to do this for
  routines that take both an M and N dimension.
