# zlaein: Translation Learnings

## Complex number handling

-   The Fortran reference calls `ZLADIV` for complex division. In the JS
    translation this maps to `cmplx.divAt( out, oi, a, ai, b, bi )`, which
    writes the result into a small scratch `Float64Array( 2 )` buffer that
    lives alongside the other locals. Early drafts reused `vv[ oV ]` as the
    scratch, which silently clobbered `v[0]` before the main inverse-iteration
    loop — the scratch buffer must be independent of `v`.
-   The CABS1 / |B(i,i)| checks against |H(i+1,i)| were inlined as
    `Math.abs(re) + Math.abs(im)` rather than calling `cmplx.absAt`, matching
    the `CABS1` macro in the Fortran source.

## Translation pitfalls

-   ZLAEIN is considerably simpler than DLAEIN: there is no complex-eigenvalue
    branch (since `w` is already complex) and no imaginary workspace path, so
    much of the structure collapses to the same logic as the real eigenvalue
    branch of DLAEIN.
-   The TRANS flag for the left-eigenvector path is `'C'` (conjugate transpose)
    in LAPACK — this maps to `'conjugate-transpose'` for `zlatrs`, not
    `'transpose'`. DLAEIN uses `'T'` which would become `'transpose'`, but for
    complex routines the Hermitian adjoint is the correct operation.

## Dependency interface surprises

-   `zlatrs` uses complex-element strides (not Float64/double-based strides).
    `v`, `B`, and `RWORK` are passed through with their original strides; the
    sub-routine does the `* 2` conversion internally.
-   Unlike `dlaein`, `zlaein` does not need a CNORM workspace field beyond what
    `RWORK` provides; `RWORK` serves as `CNORM` for `zlatrs`.
