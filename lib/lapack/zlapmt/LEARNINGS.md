# zlapmt: Translation Learnings

## Translation pitfalls

- Direct mechanical port from dlapmt. The only change is that each column swap now moves two Float64 values (real + imaginary) per matrix row instead of one. No index off-by-ones encountered.
- The -(k+1) encoding for 0-based cycle tracking (avoiding -0 === 0) was already established in dlapmt and carried over unchanged.

## Dependency interface surprises

- N/A. zlapmt is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The d-to-z porting for permutation routines (dlapmt->zlapmt, dlapmr->zlapmr) could be automated since the algorithm is identical -- only the element swap width changes (1 double vs 2 doubles). A transform rule in transform.py could handle this pattern.

## Coverage gaps

- N/A. 100% line, branch, and function coverage achieved with the 13-test suite.

## Complex number handling

- No complex arithmetic is performed. The routine only swaps column data. reinterpret() converts Complex128Array to Float64Array, and each swap copies both the real part (index) and imaginary part (index+1). Strides and offsets are in complex elements at the API boundary and multiplied by 2 internally for Float64 indexing.
