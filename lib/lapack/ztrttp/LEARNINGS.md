# ztrttp: Translation Learnings

## Translation pitfalls

- Straightforward element copy -- no complex arithmetic involved, just copying real+imaginary pairs via Float64Array views.
- The lower-triangle inner loop starts at `i = j` (not `i = j+1`) because it includes the diagonal. This matches the Fortran `DO I = J, N` pattern directly.
- The `*2` conversion for complex-element strides/offsets to Float64-based strides/offsets is the main mechanical step (sa1 = strideA1 * 2, etc.).

## Dependency interface surprises

- N/A -- ztrttp is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The d-to-z translation for simple copy/set routines (dtrttp -> ztrttp, dtpttr -> ztpttr) is highly mechanical: add reinterpret, multiply strides/offsets by 2, copy two elements instead of one. Could be automated for this class of routines.

## Coverage gaps

- N/A -- 100% line and branch coverage achieved on base.js. The routine is simple enough that all paths (upper/lower) are easily exercised.

## Complex number handling

- No complex arithmetic is performed -- this routine only copies complex elements from full storage to packed storage. The reinterpret() pattern is used to access real and imaginary parts as contiguous Float64 pairs, copying both parts per element.
