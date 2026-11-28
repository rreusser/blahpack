# zpbrfs: Translation Learnings

Complex Hermitian positive definite band iterative refinement with error bounds.
Direct complex analog of `dpbrfs`, using `zhbmv`/`zpbtrs`/`zlacn2` instead of
`dsbmv`/`dpbtrs`/`dlacn2`.

## Translation pitfalls

- CABS1 instead of abs: Backward error uses `|Re(z)| + |Im(z)|` (the
  1-norm proxy), not `|z|`. Defined as a local helper `cabs1At(view, idx)`.
- Diagonal elements are real: For Hermitian matrices, diagonal entries
  have zero imaginary part. The Fortran uses `ABS(DBLE(AB(KD+1,K)))` --
  in JS this means reading only `ABv[... + 0]` (real part), not calling
  `cabs1At`.

## Dependency interface surprises

- zhbmv takes Complex128 scalars (alpha, beta), not plain numbers.
  Use `new Complex128(-1.0, 0.0)` for -ONE.
- zlacn2 (complex version) takes Complex128Array workspace, returns
  estimates through Float64Array EST and Int32Array KASE.

## Automation opportunities

- EQUIVALENCE cannot appear inside BLOCK constructs in gfortran. The Fortran
  test pattern needs subroutines with CONTAINS instead of blocks.

## Coverage gaps

- All major paths tested: upper/lower triangle, KD=0/1/2, single/multiple
  RHS, N=0 quick return, N=1 edge case.
- FERR/BERR tolerance is 0.5 (order-of-magnitude) since exact values depend
  on floating-point accumulation order.

## Complex number handling

- Workspace layout: WORK is Complex128Array (2*N complex elements).
  WORK(0:N-1) for residual/zlacn2 X, WORK(N:2N-1) for zlacn2 V.
  RWORK is Float64Array (N elements) for backward error accumulator.
  This replaces dpbrfs's 3-segment WORK + IWORK split.
- Complex scaling in zlacn2 loop: both real and imaginary parts must be
  scaled by RWORK: `Wv[ix] *= RWORK[i]; Wv[ix+1] *= RWORK[i]`.
- All complex array parameters use complex-element strides; the base.js
  function converts to Float64 strides internally with `*2`.
