# dtfttp: Translation Learnings

## Translation pitfalls

- Fortran uses 0-based indexing for both ARF(0:*) and AP(0:*), which maps directly to JS 0-based arrays without adjustment. This made the translation simpler than typical LAPACK routines.
- The eight code paths (odd/even N x normal/transpose x upper/lower) each use distinct index arithmetic patterns. Translating each block independently, keeping the same variable names (ijp, jp, js, lda, etc.), was the safest approach.
- The `DO IJ = ...` loops where `IJ` is both the loop variable and the array index (lines like `DO IJ = JS, JS + J`) required translating to `for (ij = ...; ij <= ...; ij += 1)` where ij is used directly as the index.

## Dependency interface surprises

- N/A: dtfttp has no BLAS/LAPACK dependencies. It is a pure data-copy routine.

## Automation opportunities

- The RFP format conversion routines (dtfttp, dtfttr, dtpttf, dtrttf, dtrttp, dtpttr) share very similar structure. A template-based generator could produce all six from a parameterized description of the source/target format pairs.

## Coverage gaps

- 100% line and branch coverage achieved. All 8 code paths (2x2x2 combinations) are covered by the test suite with both odd (N=5,7) and even (N=6,8) matrix sizes.

## Complex number handling

- N/A: dtfttp is a real-valued routine.
