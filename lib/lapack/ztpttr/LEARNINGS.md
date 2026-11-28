# ztpttr: Translation Learnings

## Translation pitfalls

- Direct mechanical port from dtpttr. The only change is using `reinterpret()` to get Float64Array views and copying both real and imaginary parts (index and index+1) per element.
- Strides and offsets are in complex elements at the API boundary, multiplied by 2 internally for Float64 indexing. This matches the standard complex convention.

## Dependency interface surprises

- N/A. ztpttr is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The d-prefix to z-prefix port for simple copy/unpack routines is fully mechanical. Could be automated with a transform rule: for each scalar copy `A[x] = B[y]`, emit two copies for real and imaginary parts.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.

## Complex number handling

- No complex arithmetic needed. This routine only copies complex values element-by-element (real and imaginary parts separately). No `cmplx.js` calls required.
- Used `reinterpret()` pattern at function entry to get Float64Array views of Complex128Array inputs.
