# dtrsm: Translation Learnings

## Translation pitfalls

- [x] Eight major code paths from (side x uplo x transa) = (L/R) x (U/L) x (N/T), each with a nounit diagonal variant. 12 total branches.
- [x] The "right, transpose" paths (R,U,T and R,L,T) have a different loop structure: outer loop is over K (columns of A), with alpha scaling at the end of each K iteration rather than at the beginning.
- [x] In the "left, no-trans, upper" path, the K loop runs backward (M-1 down to 0), which is the back-substitution direction.
- [x] The zero-element guard `if (B[ib] !== 0.0)` is critical for the left-side no-transpose paths -- it skips entire column updates when the pivot element is zero.
- [x] Similarly, `if (A[...] !== 0.0)` guards in right-side paths skip entire row updates for zero off-diagonal elements.
- [x] The `nounit` flag controls whether diagonal elements are divided (non-unit) or assumed to be 1 (unit). When diag='U', stored diagonal values are ignored entirely.

## Dependency interface surprises

- [x] None. DTRSM is self-contained.

## Automation opportunities

- [x] The alpha-scaling loop pattern (`if alpha !== 1.0, scale all B in column j`) appears in 6 of the 8 paths. Could be extracted as a helper.
- [x] The Fortran structure maps 1:1 to JS with mechanical index translation. The 8 branches are independent and could be auto-generated from a template.

## Coverage gaps

- [x] Initial coverage was 89.09% due to `alpha !== 1.0` branches in left-lower-N, right-upper-N, right-lower-N, right-upper-T, and right-lower-T paths. All tests used alpha=1.0 for those branches.
- [x] Added 5 tests with alpha=2.0 covering all uncovered paths. Final coverage: 100%.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (ztrsm) would need conjugate-transpose handling for 'C' transa and interleaved Re/Im storage.
