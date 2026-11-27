# zunmhr: Translation Learnings

## Translation pitfalls

- ILO/IHI are 1-based. The A offset for zunmqr is `offsetA + ilo*strideA1 + (ilo-1)*strideA2`, and TAU offset is `offsetTAU + (ilo-1)*strideTAU`. The C offset for the left case is `ic=ilo` (0-based row), and for the right case `jc=ilo` (0-based column). These match dormhr exactly.
- Fortran test EQUIVALENCE for complex arrays: `C_r(12, 6)` equivalenced to `C(6, 6)` gives 12 doubles per column. Must print enough doubles (e.g., 60 for 5x5 in LDA=6) and extract with `extractColMajor` using LDA=6 on both JS output and fixture data.
- Initial Fortran test printed wrong number of doubles (50 instead of 60), missing the last partial column. Fixed to print `ncols * 2*LDA` doubles.

## Dependency interface surprises

- **zunm2r and zlarf only accepted long-form string parameters** (`'left'`, `'no-transpose'`) but zunmqr passes short-form (`'L'`, `'N'`, `'C'`) through to them. This caused zunm2r to treat all left-side applications as right-side (since `side === 'left'` was false for `'L'`), and zlarf to treat all left applications as right. Fixed both to accept both forms: `side === 'left' || side === 'L'` and `trans === 'no-transpose' || trans === 'N'`.
- This bug was latent because zunmqr's own tests used `zgeqr2` to generate reflectors and tested at the zunmqr level with long-form strings. zunmhr was the first caller to use short-form strings via zunmqr's pass-through to zunm2r.

## Automation opportunities

- The string convention mismatch (short-form vs long-form) should be audited across all z-prefix routines. A systematic grep for `=== 'left'` without `|| side === 'L'` would find all affected routines.

## Coverage gaps

- 100% line/branch/function coverage on base.js. No gaps.
- zunmhr is a thin wrapper around zunmqr, so the main coverage concern is the offset arithmetic, which is exercised by both full (ILO=1, IHI=N) and partial (ILO=2, IHI=4) test cases.

## Complex number handling

- zunmhr performs no complex arithmetic itself. It only computes integer offsets and delegates to zunmqr. The Complex128Array / reinterpret pattern is used only in the test file for fixture comparison.
