# zlansb: Translation Learnings

## Translation pitfalls

- The key distinction from zlanhb (Hermitian): zlansb is **complex symmetric**, meaning
  A(i,j) = A(j,i) with NO conjugation. The diagonal is fully complex, not forced real.
- Every element (including diagonal) uses complex modulus (`cmplx.absAt`) for max/one/inf norms.
- For Frobenius norm, the diagonal contribution uses `zlassq` (complex sum-of-squares), not
  a manual real-valued accumulation as in zlanhb.

## Dependency interface surprises

- `zlassq` returns `{scl, sumsq}` object (not array or separate out-params).
- `zlassq` strides/offsets are in complex elements; internally converts to Float64 indexing.
- Fortran deps for compilation require `la_constants` and `la_xisnan` modules in addition
  to `disnan`/`dlaisnan` -- the auto-generated deps file missed these.

## Automation opportunities

- `deps.py` should detect `.f90` module dependencies (`la_constants`, `la_xisnan`) that
  are needed transitively by routines like `zlassq`. Currently these must be added manually.

## Coverage gaps

- All four norm types covered for upper/lower with K=2, K=1, and K=0 (diagonal only).
- Edge cases: N=0, 1x1 matrix with complex diagonal.
- Unknown norm type returns 0.

## Complex number handling

- Used `reinterpret` + `cmplx.absAt` for all complex modulus operations in hot loops.
- No conjugation needed anywhere (symmetric, not Hermitian).
- `zlassq` handles complex elements natively -- no need for separate real/imag accumulation.
