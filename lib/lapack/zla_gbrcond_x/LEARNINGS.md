# zla_gbrcond_x: Translation Learnings

## Translation pitfalls

- The Fortran routine computes `RWORK(i) = sum_j CABS1(AB(i,j) * x(j))`
  where the product `AB*x` is complex and CABS1 is applied to the complex
  product, not to each factor separately. It is NOT equivalent to
  `|AB(i,j)| * |x(j)|` — the cross terms in the complex multiplication
  matter. Compute `prod = aR*xR - aI*xI` and `aR*xI + aI*xR`, then
  `|Re(prod)| + |Im(prod)|`.
- Fortran orders quick-return checks AFTER the RWORK/anorm loop
  (`IF (N.EQ.0)` and `IF (ANORM.EQ.0)` come after the sum-of-rows).
  With `N == 0` the loop is empty so it doesn't matter, but for
  `ANORM == 0` the early exit must occur after the per-row sums.

## Dependency interface surprises

- `zgbtrs` takes `B` as a 2D array `(B, strideB1, strideB2, offsetB)`.
  For a single right-hand side (`nrhs=1`) the `strideB2` is unused,
  but the convention used by `zgbrfs` is to pass
  `(WORK, strideWORK, N * strideWORK, offsetWORK)`. Follow that.
- `zlacn2` expects its V buffer as `WORK(N+1..2N)` — the Fortran call
  is `ZLACN2(N, WORK(N+1), WORK, ...)`, so in JS the V offset is
  `offsetWORK + N * strideWORK` while X offset is `offsetWORK`.

## Complex number handling

- `CABS1` (sum of abs parts) is inlined everywhere; `|A*x|` uses the
  complex product expansion written out explicitly with a comment.
- Division of WORK by X uses `cmplx.divAt` (robust Baudin-Smith) — never
  inlined.
- `WORK` is `Complex128Array` of length `2*N` (X and V segments).
  `RWORK` is `Float64Array` of length `N`.
- For the TRANS='T' branch the Fortran code calls `ZGBTRS('Conjugate
  transpose', ...)`, not `'Transpose'`. The JS wrapper therefore treats
  anything that is not `'no-transpose'` as `'conjugate-transpose'`,
  matching Fortran semantics.
