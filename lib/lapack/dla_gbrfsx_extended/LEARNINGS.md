# dla_gbrfsx_extended: Translation Learnings

## XBLAS dependency (major)

The reference LAPACK source calls `BLAS_DGBMV_X` and `BLAS_DGBMV2_X` — the
extended-precision XBLAS routines. These are _not_ part of reference LAPACK;
they live in an optional external XBLAS library. Without XBLAS (the common
case), the routine cannot even link. This translation follows the standard
"no-XBLAS fallback": both calls degrade to regular `dgbmv`. The function
therefore accepts `prec_type` for API compatibility but ignores it — the
routine always runs at plain float64 precision.

For the Fortran fixture generation, the test program defines local stub
subroutines `BLAS_DGBMV_X` / `BLAS_DGBMV2_X` that delegate to `DGBMV`. Both
stubs live at the bottom of `test/fortran/test_dla_gbrfsx_extended.f90`.

## Fortran reference quirk: `DGBMV(TRANS, M, N, KL, KU, …)` with `M = KL+KU+1`

Inside the refinement loop, the `BASE_RESIDUAL` branch calls
`CALL DGBMV( TRANS, M, N, KL, KU, ..., RES, 1 )` with `M = KL+KU+1` instead
of the expected `M = N`. Since `Y_PREC_STATE` is initialized to
`EXTRA_RESIDUAL`, the `BASE_RESIDUAL` branch is only reachable via explicit
state transitions and is not exercised by default. The JavaScript
translation calls `dgbmv(trans, N, N, kl, ku, …)` everywhere, matching the
intended mathematical operation rather than reproducing the odd `M`.

## Signature generator consumed `NRHS`

`bin/signature.py` detected `NRHS` as a "consumed" dimension parameter and
dropped it from the generated stdlib-js signature. But `DLA_GBRFSX_EXTENDED`
absolutely needs `NRHS` at runtime — it drives the outermost loop. The
translation puts `nrhs` back in the signature (position 6), and the
`@stdlib/signature-conformance` warning now shows 58 vs 56 because the
`ERR_BNDS_NORM` / `ERR_BNDS_COMP` 2D arrays legitimately need `stride1,
stride2, offset` triples. The rule expects `stride, offset` pairs (1D),
which is a signature-generator gap worth fixing in a follow-up.

## Fortran test: Leading-dimension vs NRHS mismatch on `ERR_BNDS_*`

The Fortran dummy argument is declared `ERR_BNDS_NORM(NRHS, *)` — the
leading dimension is the _actual_ NRHS passed at the call site. If the
test declares a caller-side `err_bnds_norm(NRHS_MAX, NERRBND)` with
`NRHS_MAX = 2` and calls with `NRHS = 1`, the routine writes with stride
1 while the caller's array has stride 2. The written value ends up in a
different slot than what the test reads, and you get an all-zeros /
all-initial-value fixture that silently corrupts the reference data. This
is exactly the class of bug called out in the main CLAUDE.md.

**Fix:** declare the error-bound arrays as a 1D flat buffer of size
`NRHS_MAX * NERRBND` and pass it to the Fortran subroutine. The subroutine
then sees the leading dim equal to the actual NRHS, and reads like
`ebn(nrhs + 1 : 2*nrhs)` retrieve the `LA_LINRX_ERR_I = 2` column
correctly.

## `dgbtrs` signature has TWO strides + offset

`dgbtrs(trans, N, kl, ku, nrhs, AFB, s1, s2, off, IPIV, si, oi, B, sB1, sB2, offB)`
— the right-hand side `B` is a 2D matrix with `strideB1, strideB2,
offsetB`, not a 1D vector. When calling with a single vector `DY`, you
must still supply _both_ strides; pass `N * strideDY` as `strideB2` (it
is unused when `nrhs = 1` but the parameter is positional). Forgetting
the second stride silently shifts subsequent arguments and produces
garbage solutions that look like "no refinement applied".

## Uncovered branches are genuine state-machine corners

The `x_state` / `z_state` / `y_prec_state` state machines have several
branches that only fire for pathological inputs: the `EXTRA_Y` precision
promotion, `NOPROG_STATE` recovery, and `dz_z > dz_ub` regression. With
well-conditioned tridiagonal fixtures these transitions effectively
never happen. The current test suite hits 85.19% branch coverage which
is above the 85% gate but inherently hard to push higher without XBLAS
(the EXTRA_Y branches require the extended-precision path).
