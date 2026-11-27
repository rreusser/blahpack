# dsytf2_rook: Translation Learnings

## Translation pitfalls

- The _rook variant differs from `dsytf2` in three key places:
  (1) an iterative pivot search loop that repeats until the rook criterion
  is satisfied, (2) a "first swap" interchange between rows/cols K and P
  when `kstep=2` and `p != k`, and (3) the IPIV encoding — BOTH entries of
  a 2x2 block are negative, with `IPIV[k]=~p` and `IPIV[k-1]=~kp` (upper)
  or `IPIV[k]=~p`, `IPIV[k+1]=~kp` (lower). Each entry encodes its own
  swap target independently, unlike `dsytf2` where both entries hold the
  same value.
- `convertIPIV` from `dsytf2` works unchanged for the rook format:
  Fortran's `-p` equals JS's `~(p-1) = -p` for negative (2x2) entries.
- The sfmin fallback path (when `|A(k,k)| < sfmin`) is required for
  correctness near underflow. Use `FLOAT64_SMALLEST_NORMAL` and apply
  the rank-1 update with `-d11` (not `-1/d11`) since we divide the
  column by d11 first.
- `no-negated-condition` lint rule required rewriting `!( x < y )` as
  `x >= y` — note these are NOT NaN-equivalent. The original Fortran
  intent is NaN-safe; assume well-behaved inputs or add NaN guards.

## Dependency interface surprises

- `dsyr` signature in this codebase takes `(uplo, N, alpha, X, sx, offsetX,
  A, sa1, sa2, offsetA)` — note 3 A-parameters vs classical BLAS.
- `dswap` uses `(N, X, sx, offsetX, Y, sy, offsetY)` — matches stdlib
  convention.
- `idamax` returns a 0-based index.

## Testing notes

- Good coverage (≥90%) of the rook pivot search loop requires matrices
  with a specific structure: `absakk < alpha*colmax` AND repeated
  row-column chases. The "chase" matrices (exponentially growing
  off-diagonals with tiny diagonal) exercise the pivot loop iteration
  branches. Some branches (like the `p = imax; colmax = rowmax` update
  path and the `first swap with p != k`) remain hard to trigger —
  they require very specific input patterns.
