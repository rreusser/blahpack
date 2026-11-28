# zhetrf_rook: Translation Learnings

## Translation pitfalls

- **No trailing-submatrix permutations.** Unlike `zhetrf_rk` (which loops
  after each panel and applies `zswap` to the trailing submatrix using the
  newly-stored IPIV), `zhetrf_rook` performs ALL row/column swaps inside
  `zlahef_rook` during the panel factorization itself. Copy-pasting the
  `zhetrf_rk` driver structure but forgetting to delete the swap loop
  would re-swap rows that are already in their final positions and silently
  corrupt the factorization. The Fortran source for `zhetrf_rook` has no
  such loop — only the IPIV index-adjustment loop in the lower-uplo branch.
- **IPIV index adjustment for lower uplo.** When `zlahef_rook` returns
  panel-local pivot indices, the lower-uplo driver shifts them to global
  indices: positive entries get `+= k-1`, negative (2x2) entries become
  `~( ~p + k - 1 )` to preserve the bitwise-NOT encoding while shifting
  the underlying 0-based row by `k-1`. The upper-uplo branch does NOT
  need this — `zlahef_rook(upper, ...)` produces global indices directly.
- **WORK/LWORK dropped at API boundary.** Following the project convention
  (no ILAENV, no LWORK queries), the JS API exposes neither `WORK` nor
  `lwork`. NB is hardcoded to 32 and the workspace `Complex128Array(N*32)`
  is allocated internally. The scaffold-generated wrapper still listed
  WORK/strideWORK/lwork — overwrite with the `zhetrf_rk`-style signature.

## Dependency interface surprises

- **`zlahef_rook` returns `{ kb, info }` object.** Match the unpacking
  pattern from `zhetrf_rk` (which uses `zlahef_rk`). Both panel kernels
  share the same return shape.
- **`zhetf2_rook` returns plain integer info** (no `kb` — that's just `k`
  for the unblocked tail).

## Complex number handling

- This driver does not perform any complex arithmetic itself — all the
  numerical work is delegated to `zlahef_rook` and `zhetf2_rook`. The
  driver only allocates `Complex128Array` workspace and passes
  complex-element strides through unchanged. The `reinterpret` warning
  from the gate is therefore expected and harmless (matches `zhetrf_rk`).

## Test fixture / coverage notes

- Reused the `zhetrf_rk` test harness verbatim minus the `e` parameter
  and `E` array assertions. The 12-case fixture (small, indef, blocked
  N=33/50, n=0/n=1 edge cases) covers all driver branches: 100% line,
  95.24% branch on base.js. The single uncovered branch is the
  `( N > 0 ) ? N : 1` fallback in the unblocked-allocation path's
  `ldwork` ternary, which only fires when `N === 0` (already short-
  circuited above).

## Process notes

- The `init_routine.py` scaffold faithfully reproduces the Fortran
  signature, INCLUDING the `WORK`/`LWORK`/`offsetWORK` parameters that
  the project convention deletes. Always cross-check the scaffolded
  ndarray.js / `<routine>.js` signature against the closest already-
  translated counterpart (`zhetrf_rk` here) before writing tests, or
  the test arity assertions and example call signatures will lag behind.
