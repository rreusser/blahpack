# dsytrs_3: Translation Learnings

## Translation pitfalls

- `dsytrs_3` differs structurally from `dsytrs`: it uses three `dtrsm` calls
  (lower-triangular solve, diagonal solve, upper-triangular solve) rather
  than the rank-1 `dger`/`dgemv` updates used by `dsytrs`. The block diagonal
  matrix `D` is stored split — diagonal entries on `A(k,k)`, off-diagonal
  entries in a separate vector `e`.
- Critical IPIV semantics: `dsytrs_3` uses `ABS(IPIV(K))` for the row swap
  in BOTH `1x1` and `2x2` pivot block cases. The sign of `IPIV(K)` is only
  read inside the `D \ B` loop to dispatch between `1x1` and `2x2` solves.
  This is simpler than `dsytrs`, which has different swap semantics for
  the two cases.
- IPIV uses the bitwise-NOT convention from `dsytrf_rk`: positive
  0-based indices for `1x1`, `~kp` (`-kp-1`) for `2x2`. Reading
  `kp = (raw >= 0) ? raw : ~raw` recovers the swap row in either case
  while preserving sign information for the diagonal-solve dispatch.
- The `2x2` diagonal-solve loop walks pivots in reverse order for upper
  (`i--, i--` after consuming a 2x2 block) and forward for lower
  (`i++, i++`). The `i > 0` / `i < N-1` guard is structural — it never
  fails on a valid factorization because a `2x2` block can never start
  at the trailing edge.

## Dependency interface surprises

- `dtrsm` accepts diag = `'unit'` here because the factor `U` (or `L`)
  has implicit unit diagonal — the diagonal entries of `A` belong to `D`,
  not to the triangular factor.
- The Fortran test harness needs `dlamch` in the deps file in addition to
  `dsytrf_rk`/`dlasyf_rk`/`dsytf2_rk` and the ILAENV chain. `bin/deps.py`
  only walks the immediate dependency tree of the routine being
  translated, not its Fortran-only test prerequisites.

## Test data approach

- The Fortran test prints `A`, `e`, `IPIV`, and `b` post-factorization
  so the JS test can use the exact factored inputs without needing a JS
  port of `dsytrf_rk`. Fortran 1-based IPIV is converted to the JS
  bitwise-NOT convention by leaving negative values unchanged and
  subtracting 1 from positives.
