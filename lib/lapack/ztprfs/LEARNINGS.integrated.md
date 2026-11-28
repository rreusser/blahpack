# ztprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing uses `kc` cursor, advancing by `k+1` (upper) or
  `N-k` (lower) per column. The complex version uses the Float64 reinterpret
  view, so indices are multiplied by 2 (e.g., `APv[(offsetAP + kc + i) * 2]`).
- The Fortran ZTPRFS uses `TRANSN = 'N'` and `TRANST = 'C'` (or reversed).
  In JS, these become `'no-transpose'` and `'conjugate-transpose'`.
- RWORK replaces IWORK from the real version (dtprfs). RWORK stores the real
  componentwise bounds, while WORK is now a Complex128Array for the complex
  residual/condition estimation vectors.
- The CABS1 function (`|Re(z)| + |Im(z)|`) is used instead of `abs()` for
  all componentwise magnitude calculations, matching the Fortran convention.

## Dependency interface surprises

- zlacn2 signature differs from dlacn2: it uses Complex128Array for V and X
  with strides in complex elements, and the EST/KASE parameters remain as
  Float64Array[1]/Int32Array[1]. No ISGN array (used in the real version).
- zlacn2's FERR result goes through EST[0] (a Float64Array), not directly
  into FERR[j].
- zaxpy requires a Complex128 scalar, not a plain number. Using
  `new Complex128(-1.0, 0.0)` for the `-ONE` constant.
- ztpmv/ztpsv use Complex128Array with strides in complex elements.

## Automation opportunities

- The CABS1 pattern (`abs(re) + abs(im)`) could be a shared utility since
  it's used across multiple complex LAPACK routines.

## Coverage gaps

- All 8 branch combinations (upper/lower x no-transpose/conjugate-transpose
  x unit/non-unit) are covered, plus multi-RHS, N=0, and N=1.
- The exact-solve test pattern means BERR is always near zero. A test with
  perturbed X would exercise BERR > 0, but current tests verify correctness
  against Fortran reference output.

## Complex number handling

- AP, B, X, WORK are Complex128Array; FERR, BERR, RWORK are Float64Array.
- Complex element access uses `reinterpret(array, 0)` to get a Float64 view,
  then indexing with `offset * 2` for the real part and `offset * 2 + 1` for
  the imaginary part.
- CABS1 is inlined as `abs(re) + abs(im)` for performance rather than
  importing from a separate module.
- The condition estimation loop (zlacn2) uses WORK[0..N-1] as X and
  WORK[N..2N-1] as V in complex elements.
- Scaling by real RWORK entries: `Wv[idx] *= RWORK[i]` for both real and
  imaginary parts separately.
