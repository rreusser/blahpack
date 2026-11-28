# zhptri: Translation Learnings

## Translation pitfalls

- Using 1-based Fortran-style internal indices (k, kc, kcnext, kpc, kx) was essential for this routine due to the deeply nested packed-storage index arithmetic. The `oAP + ((pos - 1) * sap)` pattern converts cleanly.
- The singularity check loop reuses `info` as the loop variable, which is unusual. Must reset `info = 0` after the loop.
- zhptrf JS has a bug in the upper-triangle 2x2-pivot swap path. The factored AP values differ from Fortran when IPIV has kp < k (interchange with earlier row). Test workaround: provide pre-factored AP from Fortran fixtures for swap coverage tests.

## Dependency interface surprises

- `zdotc` returns a `Complex128` object. To extract `DBLE(ZDOTC(...))` (the real part), use `real(zdotc(...))` where `real` is `@stdlib/complex/float64/real`.
- `zhpmv` takes `Complex128` scalars for alpha and beta. For `-1+0i`, create `new Complex128(-1.0, 0.0)` at module scope.
- `cmplx.absAt(view, idx)` computes complex modulus at a Float64Array position (safe, no overflow issues).

## Automation opportunities

- N/A. The init_routine + gen_test pipeline worked well.

## Coverage gaps

- Upper-triangle conjugate-swap loop (lines 228-238 in base.js) requires kp <= k-2 in the pivot interchange. This needs a matrix where zhptrf selects a pivot that's at least 2 rows away from the current column. Would require a 5+ element matrix with specific structure. Coverage is 97.3% without it, exceeding the 90% target.

## Complex number handling

- Complex modulus (`ABS(z)` in Fortran) uses `cmplx.absAt()` - never inlined.
- Inlined real-scalar division of complex: `AP / t` where t is real is safe (just divide both parts by t).
- The 2x2 block inversion uses real arithmetic on the diagonal and real-scalar division of the complex off-diagonal - no complex division needed.
- `imag()` from `@stdlib/complex/float64/imag` used to extract imaginary part of `zdotc` return for the off-diagonal update in the 2x2 path.
