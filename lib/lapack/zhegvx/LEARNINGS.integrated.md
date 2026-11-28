# zhegvx: Translation Learnings

## Translation pitfalls

- zhegvx is a thin driver routine: zpotrf -> zhegst -> zheevx -> backtransform.
  The Fortran source is ~130 lines of real logic; JS translation is straightforward.
- Key difference from zhegv: eigenvectors go into Z (not A), since zheevx writes
  eigenvectors to a separate output matrix. The backtransform (ztrsm/ztrmm) must
  operate on Z, not A.
- The `out.M` output convention from zheevx must be propagated correctly. When
  `info > 0` and backtransforming, M is overridden to `info - 1` (matching Fortran).

## Dependency interface surprises

- zheevx uses `'compute-vectors'`/`'no-vectors'` for jobz, while zheev uses
  `'compute'`/`'none'`. zhegvx adopts zheevx's convention so strings pass through.
- zheevx uses `'all'`/`'value'`/`'index'` for range parameter.
- zheevx returns M via an `out` object (`out.M`), not a direct return value.
  zhegvx propagates this same pattern.

## Automation opportunities

- The zhegvx deps file required manual BFS to find all transitive LAPACK
  dependencies (the auto-generated one from deps.py was incomplete -- missing
  zhetrd, zstein, zunmtr, zlacpy, zungtr, zsteqr and many more). The la_xisnan
  and la_constants modules were also needed. A deeper BFS in deps.py that parses
  CALL and EXTERNAL statements would fix this for all routines.

## Coverage gaps

- Lines 142-143: the `info > 0` path during backtransform (when zheevx reports
  eigenvector non-convergence). This requires specially crafted ill-conditioned
  input that causes inverse iteration to fail, which is extremely hard to trigger
  with small 3x3 matrices.
- 98.87% line coverage, 93.33% branch coverage -- well above thresholds.

## Complex number handling

- No complex arithmetic is performed directly in zhegvx. All complex work is
  delegated to zpotrf, zhegst, zheevx, ztrsm, and ztrmm.
- CONE = Complex128(1,0) is passed to ztrsm/ztrmm as the alpha scaling parameter.
