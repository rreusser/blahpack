# dsyevr: Translation Learnings

## Translation pitfalls

- Closely modeled on zheevr. The real-valued version is simpler: no complex reinterpret, uses Float64Array directly.
- The Fortran routine uses WORK for both TAU and tridiagonal elements. In JS we partition WORK manually: [indtau, indd, inde, indee, indwk].
- The `out.M` pattern (object output parameter) is inherited from zheevr to return the number of eigenvalues found.
- ISUPPZ uses 1-based indices (matching Fortran), matching the N=1 special case where ISUPPZ(1)=ISUPPZ(2)=1.

## Dependency interface surprises

- dstebz and dstein use long-form string parameters ('all', 'value', 'index', 'block', 'entire') not single chars. Initial implementation used 'A'/'V'/'I'/'B'/'E' which caused info=-1 parameter errors.
- dormtr expects 'left'/'right', 'upper'/'lower', 'no-transpose'/'transpose' (long-form strings).

## Automation opportunities

- The dstebz/dstein fallback path is identical between dsyevr and zheevr (and dstevr). Could be extracted into a shared helper.

## Coverage gaps

- Scaling paths (iscale=1) not covered: would require matrices with extremely small or large norms.
- dsterf failure fallthrough path not covered: requires a matrix that causes dsterf to fail, which is rare.
- N=1 with RANGE='value' where eigenvalue falls outside the interval not tested (line 175-179 uncovered).

## Complex number handling

- N/A: dsyevr is a real-valued routine.

## MRRR (dstemr) path

- Not implemented. This routine always uses the dstebz+dstein fallback path.
- The MRRR path requires dstemr and its deep dependency tree (dlaneg, dlarra, dlarrb, dlarrc, dlarrd, dlarre, dlarrj, dlarrk, dlarrr, dlarrv, dlar1v, dlarrf, dlasq2...).
- The fallback path produces correct results but may be slower for large matrices.
