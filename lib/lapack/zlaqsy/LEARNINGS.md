# zlaqsy: Translation Learnings

## Translation pitfalls

- The Fortran EQUED output parameter is a character ('N'/'Y'). In JS we return a string ('none'/'yes') matching the dlaqsy convention. The gate's signature-conformance rule warns about the missing equed parameter (11 vs 12 params), but this is by design since equed is returned rather than passed by reference.
- The offsetA must be multiplied by 2 when converting to Float64 index space, just like strides. This is easy to miss since offsetA is typically 0 in simple tests.

## Dependency interface surprises

- N/A. zlaqsy has only one dependency (dlamch), which is hoisted to module scope as constants (SMALL, LARGE).

## Automation opportunities

- The gate's ESLint error count regex `(\d+)\s+error` falsely matches column numbers in lint output (e.g., `4:14  error` captures "14"). This gives an inflated error count. The same issue affects dlaqsy.

## Coverage gaps

- N/A. All branches (upper, lower, N=0 quick return, no-equilibration-needed) are covered at 100% line and branch coverage.

## Complex number handling

- Since S is a real vector, the scaling operation `A[i,j] = S[j] * S[i] * A[i,j]` is purely real-scalar multiplication of complex elements. Both real and imaginary parts are scaled by the same real factor `cj * s[i]`. No complex arithmetic library functions were needed.
- Used `reinterpret(A, 0)` at function entry to get a Float64Array view, then multiplied strides and offsets by 2 for Float64 indexing.
