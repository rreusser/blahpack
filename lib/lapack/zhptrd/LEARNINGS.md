# zhptrd: Translation Learnings

## Translation pitfalls

- The Fortran code saves TAUI as a local scalar, uses TAU(1:I) as workspace
  for zhpmv/zdotc/zaxpy/zhpr2, then writes `TAU(I) = TAUI` after the
  workspace operations. In JS, zlarfg writes directly to TAU, and
  zhpmv then overwrites those same TAU elements. Must save tauiR/tauiI
  before workspace ops and restore after.
- For ZLARFG(1, alpha, ...) with complex alpha, tau is only zero if
  alphi == 0 AND xnorm == 0. When reducing the last pair in the upper
  case, the alpha element may have a nonzero imaginary part from prior
  reductions, producing a nonzero tau.
- AP is Complex128Array. All index calculations use complex-element
  offsets, but the Float64 view (apv) uses doubled indices (offset * 2).

## Dependency interface surprises

- zhpmv, zhpr2, zaxpy take Complex128 scalar objects.
- zdotc returns a Complex128 object (need real() and imag() to extract).
- zlarfg signature: `(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)`.
  Alpha and tau are Complex128Arrays with complex element offsets.

## Automation opportunities

- The Fortran deps file was auto-generated but needed manual additions
  (dladiv, dlapy3, zladiv) for transitive dependencies through zlarfg.

## Coverage gaps

- N=2 and N=3 not tested (only N=0, 1, 4). The N=4 case covers the
  non-trivial loop in both upper and lower branches.

## Complex number handling

- All arithmetic delegated to BLAS/LAPACK sub-routines.
- Only inline complex ops: reading/writing Float64 view elements via
  `apv[idx*2]` and `apv[idx*2+1]`, and constructing Complex128 scalars
  for zhpmv/zaxpy/zhpr2.
