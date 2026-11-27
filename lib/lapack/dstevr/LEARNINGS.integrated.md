# dstevr: Translation Learnings

## Translation pitfalls

- Simpler than dsyevr: no tridiagonal reduction step needed, operates directly on d/e arrays.
- Fortran's INDIWO and INDIFL overlap in the IWORK partition (both = INDISP + N). Preserved this in JS.
- d and e arrays are destroyed on exit (modified by dstebz/dstein/dscal). Tests must supply fresh copies each time.
- N=1 special case: eigenvector Z is just [1.0], no ISUPPZ output.

## Dependency interface surprises

- Same as dsyevr: dstebz uses long-form strings ('all'/'value'/'index', 'block'/'entire'), not single chars.
- dstein takes IFAIL as a separate Int32Array parameter (last 3 params: IFAIL, strideIFAIL, offsetIFAIL).

## Automation opportunities

- The dstebz+dstein+sort eigenvalue/eigenvector pattern is shared across dsyevr, dstevr, and zheevr. Could be a shared helper function.

## Coverage gaps

- Scaling paths not covered: requires tridiagonal matrices with norms near machine underflow/overflow.
- The dsterf fallthrough on failure not covered.
- Sorting with non-ascending eigenvalues from dstebz: dstebz generally returns eigenvalues in ascending order within blocks, so the sort is typically a no-op.

## Complex number handling

- N/A: dstevr is a real-valued routine.

## MRRR (dstemr) path

- Not implemented. Always uses dstebz+dstein fallback.
- Missing deps: dlaneg, dlarra, dlarrb, dlarrc, dlarrd, dlarre, dlarrj, dlarrk, dlarrr, dlarrv, dlar1v, dlarrf.
