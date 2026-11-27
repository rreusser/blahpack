# ztrrfs: Translation Learnings

## Translation pitfalls

- The Fortran WORK array is COMPLEX*16 (size 2*N), not DOUBLE PRECISION.
  The JS signature has WORK as Complex128Array and RWORK as Float64Array,
  matching the Fortran split between complex workspace and real workspace.
- The Fortran code uses TRANSN='N'/TRANST='C' (conjugate-transpose), not 'T'.
  The JS long-form equivalent is 'conjugate-transpose', not 'transpose'.
- CABS1 is a statement function: ABS(DBLE(Z)) + ABS(DIMAG(Z)). Implemented
  as a helper `cabs1At(view, idx)` operating on Float64 views.

## Dependency interface surprises

- zlacn2 uses Complex128Array for both X and V workspaces (not Float64Array
  like dlacn2). The EST output is still Float64Array and KASE/ISAVE are
  Int32Array, matching dlacn2.
- zlacn2 has no ISGN parameter (unlike dlacn2 which uses Int32Array ISGN).
  The complex version tracks signs via the complex sign of X elements.
- zaxpy takes a Complex128 scalar alpha, not a number. Used `NONE = new Complex128(-1.0, 0.0)`.

## Automation opportunities

- lint-fix.sh can break test files by overwriting them with scaffold
  templates when there are lint errors in the test file. Tests should be
  written to pass lint from the start (proper var declarations, no
  max-statements-per-line violations, etc.)

## Coverage gaps

- All test cases use exact solutions (BERR=0). The safe1/safe2 branches
  for near-zero denominators are not exercised. Would need ill-conditioned
  matrices to trigger those paths.
- Only tested N=3 matrices. Larger matrices would exercise more iterations
  of the zlacn2 reverse communication loop.

## Complex number handling

- All complex element access uses `reinterpret(arr, 0)` to get Float64 views.
- CABS1 is inlined as `Math.abs(v[idx]) + Math.abs(v[idx+1])` -- safe to inline
  since it only uses abs and addition.
- The RWORK scaling `RWORK[i] * WORK[i]` is a real-times-complex multiplication,
  done by scaling both real and imaginary parts: `wv[iw] *= RWORK[...]`.
- Complex array strides/offsets are in complex elements; the *2 conversion to
  Float64 indices happens inside base.js for all element access.
