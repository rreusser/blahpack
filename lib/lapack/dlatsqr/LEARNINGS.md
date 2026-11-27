# dlatsqr: Translation Learnings

## Translation pitfalls

- **Drop the LWORK query and `lwork` parameter.** The scaffold generated a
  signature with `lwork` at the end (since the Fortran has `LWORK` as a
  separate parameter for workspace queries). Per the project's "no
  ILAENV / no LWORK queries" convention, the JS signature drops `lwork`.
  This required regenerating the wrappers, types, repl, and README; the
  scaffold cannot infer this rule.

- **Loop bound translation `DO I = MB+1, II-MB+N, MB-N` is subtle.** In
  0-based JS this becomes `for (i = mb; i <= ii - (mb-N); i += mb-N)`.
  The Fortran upper bound is inclusive and `II = M - KK + 1` (1-based);
  in 0-based `ii = M - kk` and the same `<=` comparison applies. Verified
  by working through the case grid: when `kk=0`, the trailing `if (II <= M)`
  block is skipped (in JS: `if (ii < M)`) so the main loop must absorb the
  last interior block.

- **`numBlocks` helper edge case.** The naive
  `Math.ceil((M-N)/(MB-N))` returns 0 when `M==N` (square matrix), which
  silently allocates a zero-length T even though the routine actually
  takes the dgeqrt fallback path and writes `nb*N` entries. The test
  helper must guard with `if (MB <= N || MB >= M) return 1;` to mirror
  the dispatch in base.js. This bit one of the test cases — the m4_n4_mb6
  square test got `T = Float64Array(0)` and produced NaN comparisons.

- **T storage for the trailing block uses `ctr * N * strideT2` offset,
  not `ctr * nb * strideT2`.** Each per-block T occupies an `nb`-by-`N`
  slab, but the slab is column-stride `N`-wide along the second
  dimension, not `nb`-wide. The Fortran `T(1, CTR*N+1)` makes this
  explicit; getting the multiplier wrong corrupts the trailing block's
  T silently.

## Dependency interface surprises

- **`dgeqrt` and `dtpqrt` already fully blocked.** Both expose `nb` as
  a parameter and handle their own panel iteration; dlatsqr just calls
  each once per row block. No additional ILAENV/workspace gymnastics
  needed.

- **`dtpqrt(M=mb-N, N, l=0, nb, A, ..., B=A, ..., offsetB=offsetA + i*strideA1, ...)`.**
  The first matrix argument doubles as the running R block (always at the
  top of A) while the second argument is the next row block. Both alias
  the same `A` Float64Array but with different offsets — verify your
  dtpqrt implementation handles aliasing correctly (it does, because R
  block and B block do not overlap in memory).

## Coverage / test design

- **Test the fallback paths and the blocked path separately.** The
  `if (mb <= N || mb >= M)` early-return path needs explicit tests
  (cases m4_n3_mb8, m6_n3_mb3_mbeqn, m4_n4_mb6 cover this). The
  blocked path divides into `kk == 0` (loop ends exactly) and `kk > 0`
  (trailing dtpqrt fires) — both exercised by the m10_n2 evendiv and
  m12_n3 lastblock cases respectively.

- **`pack_matrix` Fortran helper avoids the LD-vs-EQUIVALENCE trap.** I
  borrowed dgeqrt's pattern of declaring `A(NMAX,NMAX)` once with
  `NMAX=80` and packing the active `M`-by-`N` submatrix into a
  contiguous buffer before printing via `print_array`. This avoids the
  silent stride mismatch that has corrupted other fixtures.

## Missing automation

- **Scaffolded `<routine>.js` LDT validator was wrong.** The scaffold
  used `LDT < max(1, M)` for column-major and `LDT < max(1, N)` for
  row-major, but for compact-WY routines `LDT >= nb` is the right
  constraint regardless of layout. This is the same hand-fix called
  out in the SKILL.md "Compact-WY" section — the scaffold heuristic
  cannot infer T's shape for compact-WY storage. Worth adding a
  tag/hint mechanism so scaffold knows to skip LDT-against-M/N
  validation for compact-WY routines.

- **Init scaffold left `lwork` in JS signatures.** `signature.py`
  faithfully reproduces every Fortran argument including `LWORK`, but
  the project rule strips workspace-query params. Could detect
  `LWORK` + a workspace-query early-return in the Fortran source and
  emit a signature without it.
