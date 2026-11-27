# zlapmr: Translation Learnings

## Translation pitfalls

- Direct port from dlapmr. The only difference is swapping pairs of Float64 values (re+im) per complex element instead of single Float64 values.
- The -(k+1) encoding for 0-based cycle tracking works identically for the complex version since it operates on the integer permutation array K, not on the matrix X.
- Fortran test printing of 2D complex arrays requires packing the M-by-N submatrix into contiguous storage before printing via EQUIVALENCE, because MMAX (leading dimension) differs from M. This avoids the well-documented stride mismatch bug.

## Dependency interface surprises

- N/A. zlapmr is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The d-to-z porting for permutation routines (dlapmr, dlapmt, etc.) is almost entirely mechanical: add reinterpret(), multiply strides/offsets by 2, swap pairs instead of singles. Could be automated with a transform pass.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.

## Complex number handling

- No complex arithmetic is performed -- only row swaps of interleaved re/im pairs.
- Uses complex-element stride convention (strides/offsets in complex elements at the API boundary, multiplied by 2 internally for Float64Array indexing).
- reinterpret() is called once at function entry for the Float64Array view.
