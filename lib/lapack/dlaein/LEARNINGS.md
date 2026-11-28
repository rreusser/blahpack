# dlaein: Translation Learnings

## Translation pitfalls

- The workspace matrix `B` in the complex eigenvalue path requires a
  leading dimension of at least `N+1`. DLAEIN stores the imaginary
  part of the factorization in row `N+1` (0-based row `N`) and in the
  strictly lower triangle of `B`. The real eigenvalue path only needs
  `LDB >= N`, but the complex path writes `B(N+1, *)` indices.
- Fortran pattern `DASUM( N-I, B( I, I+1 ), LDB )` is a strided sum
  along a row: the Fortran stride `LDB` in a `(LDB,*)` array traverses
  a row. The JS translation is
  `dasum( N-1-i, B, sB2, oB + i*sB1 + (i+1)*sB2 )` — pass the column
  stride `sB2`, not the original Fortran leading dimension.
- The row-interchange update `B(J+1, I+1) = B(J+1, I) - XI*TEMP`
  shuffles strictly-lower-triangle imaginary entries during the
  reduction of `B`. Easy to flip `sB1`/`sB2` here.
- When inverse iteration fails to converge, the Fortran code does
  `GO TO 120` / `GO TO 280`. Replacing this with `break` leaves the
  normalization step to run afterward; remember to unconditionally
  normalize the vector regardless of whether `INFO` ended up `0` or
  `1`.

## Dependency interface surprises

- `dlatrs` returns `scale` via a length-1 `Float64Array` output
  parameter; read `scale[0]` when comparing `vnorm >= growto * scale`.
- `dladiv` is called to perform `(xr + i*xi) / (B(i,i) +
  i*B(i+1,i))`; we pass a length-2 `Float64Array` output argument and
  copy into `VR(i)` and `VI(i)` afterward.

## Testing notes

- Fortran fixtures (`test/fixtures/dlaein.jsonl`) cover the four
  combinations of right/left eigenvector × real/complex eigenvalue,
  plus supplied-initial-vector variants. The ndarray tests also
  verify row-major reshuffles and strided/offset layouts.
- Machine constants `EPS3`, `SMLNUM`, `BIGNUM` are normally derived
  from `DLAMCH` inside `DHSEIN`. Tests hard-code the IEEE-754 double
  values used by the Fortran harness so the results are
  reproducible across platforms.
