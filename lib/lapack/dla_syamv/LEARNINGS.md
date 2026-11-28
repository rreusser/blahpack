# dla_syamv: Translation Learnings

## Translation pitfalls

- Fortran `dla_syamv` takes `UPLO` as an **integer** (`121`=upper, `122`=lower)
  via `ILAUPLO`, not a character. At the JS API boundary we use the standard
  stdlib string convention `'upper'` / `'lower'` and ignore the numeric
  encoding entirely — the `ILAUPLO` comparisons are replaced by a single
  `upper = (uplo === 'upper')` flag. The Fortran test program must pass the
  raw integers `121`/`122` (easy to miss).
- The Fortran source has four structurally-identical branches:
  `INCX=1 × (upper|lower)` and general `INCX × (upper|lower)`. The
  `INCX=1` branches are pure optimizations — there is no difference in
  results. The JS port unifies them into two branches (upper / lower)
  driven by `jx += strideX`, which matches the `dla_geamv` pattern.
- For the upper triangle, row `i` of `|A|*|x|` reads `A(j,i)` for `j<=i`
  (packed column `i`, rows `0..i`) and `A(i,j)` for `j>i` (symmetry:
  row `i`, columns `i+1..N-1`). For the lower triangle the mirror is
  swapped. Getting the stride mapping right when `strideA1 != 1` is the
  easy place to introduce a bug — column walks use `sa1`, row walks use `sa2`.
- Symbolic-zero tracking is identical to `dla_geamv`: `symbZero` stays
  `true` iff every contributing term (including the `beta*|y|` prelude)
  has at least one zero factor. The `safe1` perturbation is skipped for
  symbolically-zero entries so tests can assert exact zero.
- `SAFMIN` and `safe1` are hoisted to module scope (as a constant) and
  per-call (because `safe1 = (N+1)*SAFMIN`) respectively. Matches
  `dla_geamv`.

## Dependency interface surprises

- `dla_geamv` base.js is the canonical pattern — follow it for any future
  `dla_*amv` translation (e.g., `dla_gbamv`, `dla_sbamv`). The wrapper
  (`dla_syamv.js`) handles negative-stride `offsetX`/`offsetY` via
  `stride2offset`, so `base.js` never computes `KX`/`KY`.

## Coverage gaps

- None — base.js achieves 100% line / 96.3% branch coverage. The single
  uncovered branch is the `|| temp === 0.0` short-circuit inside the
  `symbZero &&` conjunction, which is structurally dead when the
  preceding `x[jx] === 0.0` term is already true; not worth targeting.

## Test notes

- The Fortran test uses integer UPLO parameters (`BLAS_UPPER=121`,
  `BLAS_LOWER=122`). The fixture does not record the UPLO value; JS
  tests must pass the string equivalent.
- Upper and lower paths produce identical results on a symmetric matrix,
  so both paths are exercised by passing the same matrix with both `uplo`
  values.
