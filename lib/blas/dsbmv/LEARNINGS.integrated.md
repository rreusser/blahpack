# dsbmv: Translation Learnings

## Translation pitfalls

- Upper band storage places the diagonal at row K (0-based), with
  `l = K - j` used to compute the band row as `l + i = K + i - j`.
  Lower band storage places the diagonal at row 0, with `l = -j` giving
  band row `l + i = i - j`.
- The symmetric two-temp pattern (`temp1 = alpha*x[j]`, `temp2 = 0`)
  is shared with dsymv. The key difference is the loop bounds are clamped
  to the band: `max(0, j-K)..j-1` for upper, `j+1..min(N, j+K+1)` for lower.
- The `KX`/`KY` pointer advancement for the upper band path
  (`if j >= K then KX += INCX, KY += INCY`) handles the sliding window
  of the band -- without this, the off-diagonal inner loop's starting
  pointer is incorrect once the band extends past row 0.
- For the lower path, `ix = jx` and `iy = jy` (starting from the diagonal)
  with increments inside the loop body matches the Fortran exactly.

## Dependency interface surprises

- N/A (no dependencies beyond stdlib array types).

## Automation opportunities

- N/A

## Coverage gaps

- None: 100% line and branch coverage achieved with 6 test cases covering
  upper, lower, alpha/beta scaling, n=0, alpha=0, and non-unit strides.

## Complex number handling

- N/A (real-valued routine).
