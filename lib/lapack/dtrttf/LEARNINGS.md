# dtrttf: Translation Learnings

## Translation pitfalls

- The Fortran source uses 0-based array declarations (`A(0:LDA-1, 0:*)`, `ARF(0:*)`), which maps directly to 0-based JS loop variables. No 1-based to 0-based index conversion was needed for this routine, making it an unusually clean translation.
- The 8 code paths (even/odd N x normal/transpose x upper/lower) are structurally identical between dtrttf and dtfttr -- the only difference is the direction of the assignment (read from A, write to ARF vs. vice versa). Using dtfttr as a direct template was highly effective.
- The Fortran `j = k-1` after the `DO J = 0, K-2` loop exit (in the even/transpose/upper branch) is used by a subsequent loop `DO I = 0, J`. In JS, after `for (j = 0; j <= k - 2; j += 1)`, `j` equals `k - 1`, which is the correct post-loop value. This Fortran-to-JS loop variable behavior matched without adjustment.

## Dependency interface surprises

- N/A: dtrttf is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The Fortran test for dtfttr had an LDA mismatch (passing LDA=N=5 for an array dimensioned NMAX=8). The same pattern was repeated in the dtrttf Fortran test's roundtrip case. This causes the routine to see a misaligned memory view. Future Fortran tests should either match declared and used dimensions or use LDA=NMAX consistently.
- The 8-path structure (nisodd x normalTransr x lower) is common to all RFP routines (dtrttf, dtfttr, dtfttp, etc.). A codegen template could generate base.js for any RFP routine given just the inner assignment direction.

## Coverage gaps

- 100% line and branch coverage achieved on base.js. All 8 code paths covered by N=5 (odd) and N=6 (even) fixture tests plus round-trip tests with dtfttr.

## Complex number handling

- N/A: dtrttf is a real-valued routine.
