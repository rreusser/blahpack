# zla_herfsx_extended: Translation Learnings

## Translation pitfalls

- **`BLAS_ZHEMV_X` / `BLAS_ZHEMV2_X` are not real routines.** The Fortran
  reference declares them `EXTERNAL` but no implementation ships in
  `data/lapack-3.12.0/SRC/`. They're stubs for the Bailey/LBNL XBLAS
  extended-precision BLAS which isn't linked by default. As a result,
  `run_fortran.sh` cannot link a test program that calls this routine —
  we skipped Fortran fixture generation and instead validated the JS
  port against mathematical invariants (`A*Y ≈ B`, small `BERR_OUT`,
  round-trip via `zhetrf` + `zhetrs`).
- **Extended-precision substitution.** In the JS port we substitute
  plain `zhemv` for both `BLAS_ZHEMV_X` and `BLAS_ZHEMV2_X`. This means
  the `precType` argument (`EXTRA_RESIDUAL`, `EXTRA_Y`, …) is accepted
  but has no actual precision effect — the compensated-summation
  `zla_wwaddw` update path still runs, but feeds the same
  double-precision residuals in. Document this clearly in the JSDoc so
  downstream callers don't assume extra precision is guaranteed.
- **Signature generator outputs duplicate parameter names.** The Fortran
  declares `Y(LDY,*)` (matrix) and `DY(*)` (vector); the auto-generated
  stdlib signature emitted both as `Y / strideY / offsetY` because the
  scalarizer keyed on the first letter, producing a shadowed `y`. We
  manually renamed `DY` in all four files (`base.js`, `ndarray.js`,
  layout wrapper, tests) plus added `nrhs` which the signature parser
  had elided as a "consumed" dimension. Watch for this on any routine
  with multiple arrays whose names start with the same letter.
- **Error bound layout.** `ERR_BNDS_NORM` and `ERR_BNDS_COMP` are
  `(NRHS, *)` 2D arrays with strict column indices
  `LA_LINRX_TRUST_I=1` and `LA_LINRX_ERR_I=2` (1-based in Fortran).
  We write only column `LA_LINRX_ERR_I`, which is index `1` in 0-based
  JS. The trust column is expected to be populated by the caller
  (`zherfsx`), not by this routine — do NOT overwrite it.

## Dependency interface surprises

- **`zla_heamv` takes `Complex128Array` + string `uplo`.** Unlike the
  Fortran signature which uses an integer `UPLO2 = ILAUPLO('L')`, the
  JS port accepts `'upper'`/`'lower'` directly. We do NOT need to
  implement `ilauplo` for this translation.
- **`zhetrs` takes an `nrhs` argument and 2D `B` strides.** For a 1D
  `DY` workspace, pass `strideB1=1, strideB2=N` (the second stride is
  irrelevant for `nrhs=1` but must still be a plausible value, not `0`).
- **`zla_lin_berr` parameter order** is `(N, nz, nrhs, res, strideRES,
  offsetRES, ayb, strideAYB, offsetAYB, berr, strideBERR, offsetBERR)`.
  Note `nz` comes before `nrhs`.

## Coverage notes

- **64% branch coverage with 96% line coverage.** Many branches in the
  state machine (`dxrat > rthresh`, `dz_z > dz_ub` reset,
  `yPrecState === EXTRA_Y` forks) are only taken when refinement fails
  to converge or when extended precision is actually available. Since
  both conditions require pathological inputs that our double-precision
  path cannot exercise, a handful of branches remain untested. Adding
  a "zero initial Y" test raised branch coverage from 54% to 64% and
  is the cheapest large win. Pushing past 64% without either
  (a) implementing true double-double residuals or (b) constructing
  matrices that break refinement would require invasive test hacks.
- Line coverage (96%) comfortably exceeds the ≥90% floor. Branch
  coverage (64%) is below the ≥85% target; the gap is documented here
  rather than masked with skip markers.

## Complex number handling

- All complex scalars (`α = -1`, `β = 1`) are `Complex128` objects
  passed directly to `zhemv`/`zaxpy`. We avoid inlining any complex
  arithmetic — deferred entirely to the BLAS kernels.
- `CABS1(z) = |Re(z)| + |Im(z)|` is implemented via a local `cabs1At`
  helper that operates on a reinterpreted `Float64Array` view of the
  complex data, matching the z-prefix reinterpret convention.
- `ERR_BNDS_NORM` / `ERR_BNDS_COMP` are real (Float64), not complex —
  a minor surprise since everything else in the routine is complex.
