# dtzrzf: Translation Learnings

## Translation pitfalls

- **Z-form reflectors apply LEFT-to-RIGHT for reconstruction.** The
  factorization writes `Z = H(0) * H(1) * ... * H(M-1)`, so to verify
  `A = R * Z` mathematically, apply reflectors in increasing index
  order (k=0..M-1), NOT the typical "reverse order" used for QR
  reconstruction (`Q = H(0)...H(K-1)` is also forward, but
  reconstructions of `A = QR` typically apply Q on the LEFT in reverse).
  Initial reconstruction code applied them in reverse and produced
  `R * Z^T` instead of `R * Z`, with errors of order 1e-2.

- **Loop bounds for blocked driver: `(M-KK+KI)` 0-based start, decrement
  by NB until `>= M-KK`.** The Fortran loop `DO 20 I = M-KK+KI+1,
  M-KK+1, -NB` translates 1-based to 0-based by subtracting 1 from both
  bounds. After the loop, `MU = i + NB` (where `i` is the 0-based loop
  variable's final value). This matches Fortran's `MU = I + NB - 1`
  with the 1-based-to-0-based conversion.

- **T scratch matrix needs its own leading dimension.** Fortran reuses
  the WORK buffer for T (storing T as an IB-by-IB block within an
  LDWORK-by-NB strip) by passing `WORK` as both T and (offset) workspace
  to `dlarzb`. In JS we allocate `T` separately as a tight `nb*nb`
  buffer; pass `strideT2 = nb`, NOT `ldwork`. Initial code used
  `ldwork=M` for T's stride and indexed beyond the `nb*nb` buffer,
  producing NaNs in the blocked path.

- **Integer division for Fortran `/` must use `|0`, not `Math.floor`.**
  Used `( ( M - nx - 1 ) / nb ) | 0` for the KI computation; the
  numerator is non-negative when `nx < M`, but the convention is
  preserved for safety.

- **Fortran `INFO` validation deltas.** dtzrzf has no algorithmic INFO
  value (always returns 0 on success); only argument-validation INFO
  values exist, and those are handled in the wrapper as thrown errors.

## Dependency interface surprises

- **dlarzt + dlarzb only support `direct='backward'`/`storev='rowwise'`.**
  These are the Z-form-specific block reflector helpers and reject
  other combinations. dtzrzf always passes those values.

- **dlatrz signature.** Takes `(M, N, l, A, ...)` where `l = N - M` is
  the reflector tail length. The function operates on M rows of `A`
  starting at `offsetA` and `(N-l)` to `N-1` are the trapezoid columns
  encoding the reflector tails after factorization.

- **Workspace partitioning in the Fortran ref is misleading.** The ref
  passes `WORK` as both T (for `dlarzt`) and as workspace to `dlarzb`
  (with `WORK(IB+1)` offset). The IB-by-IB T occupies the first IB
  rows of the (LDWORK x IB) strip; remaining LDWORK-IB rows of each
  column are reused as workspace. Allocating T as a standalone buffer
  in JS sidesteps the overlap entirely and is clearer.

## Coverage notes

- 100% line / 100% branch on base.js, ndarray.js, and dtzrzf.js.
- Blocked path tests use M=140, N=200 (M > NX=128) with mathematical
  reconstruction `A = R * Z` rather than fixture comparison: blocked
  vs. unblocked Fortran outputs differ in floating-point roundoff
  order, so byte-identical fixture matches across paths are not
  achievable with NB hardcoded differently from the reference.
