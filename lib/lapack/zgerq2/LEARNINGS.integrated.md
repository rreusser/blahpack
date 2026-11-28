# zgerq2: Translation Learnings

## Translation pitfalls

- The ZLACGV call before ZLARFG conjugates N-K+I elements (Fortran 1-based), which is N-K+i+1 in 0-based. After the reflector application, the unconjugation call uses N-K+I-1 elements (Fortran), which is N-K+i elements in 0-based. Getting these counts right required careful comparison with the Fortran source.
- The zlarf call uses 'right' side with the reflector vector strided along columns (strideA2), not rows. The dgerq2 real version does the same but the complex version needs the tau array passed as a Complex128Array reference with offset, not a scalar.

## Dependency interface surprises

- zlarf takes tau as a Complex128Array with offsetTau (not a scalar). This differs from dgerq2's dlarf which takes tau as a scalar value. The complex version needs this because tau is complex.
- zlacgv uses complex-element strides and offsets (it does the *2 internally).

## Automation opportunities

- N/A; the translation follows the same pattern as zgeqr2 with left/right reversed.

## Coverage gaps

- 100% line and branch coverage on base.js achieved with the 9 test cases.

## Complex number handling

- Used zlacgv for conjugation (library call, not inlined).
- Saved/restored A(row, N-K+i) as Float64 re/im pair for the reflector application.
- All arithmetic delegated to sub-routines (zlarfg, zlarf, zlacgv).
