# zhegv: Translation Learnings

## Translation pitfalls

- zhegv has WORK (Complex128Array) and RWORK (Float64Array) workspace arrays, unlike dsygv which has only WORK (Float64Array). The RWORK parameter is passed through to zheev.
- Backtransform uses 'conjugate-transpose' instead of 'transpose' from dsygv, matching the Hermitian factorization.
- The LWORK query path (lwork=-1) is present in the Fortran but omitted in our JS implementation (workspace is managed internally). If needed, callers should allocate max(1, 2*N-1) complex workspace.

## Dependency interface surprises

- zheev signature includes both WORK (complex) and RWORK (real) workspace parameters, unlike dsyev which has only WORK (real). The lwork parameter refers to complex elements.
- ztrsm/ztrmm require Complex128 alpha (CONE), not a plain number.
- The jobz convention uses 'compute'/'none' in the JS API (matching dsygv/dsyev convention), while Fortran uses 'V'/'N'.

## Automation opportunities

- The dsygv-to-zhegv conversion follows the same mechanical pattern as the other d->z conversions: swap dpotrf->zpotrf, dsygst->zhegst, dsyev->zheev, dtrsm->ztrsm, dtrmm->ztrmm, add RWORK parameter, change 'transpose'->'conjugate-transpose', wrap alpha in Complex128.

## Coverage gaps

- 97.97% line, 86.67% branch coverage. Uncovered: itype=3 upper path (line 131), and the partial eigenvector case (info > 0, lines 113-114). The latter would require constructing a matrix that causes zheev to fail partway.

## Complex number handling

- No direct complex arithmetic in zhegv. All complex operations delegated to zpotrf, zhegst, zheev, ztrsm, ztrmm.
- Single module-level CONE constant for ztrsm/ztrmm alpha.
