# zla_gerpvgrw: Translation Learnings

## Translation pitfalls

- Nearly identical to dla_gerpvgrw. The only change is using `reinterpret()` for Float64 views and replacing `abs(A[idx])` with CABS1 (`|re| + |im|`).
- Strides and offsets at the API boundary are in complex elements; multiply by 2 for Float64 indexing inside the routine.

## Dependency interface surprises

- N/A. Leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The d-to-z porting for this routine class (scalar-return, no BLAS deps, only CABS1 norm) could be fully automated: add reinterpret, define cabs1 helper, multiply strides/offsets by 2, change Float64Array types to Complex128Array in JSDoc.

## Coverage gaps

- N/A. 100% line, branch, and function coverage achieved.

## Complex number handling

- CABS1 is the only complex operation needed: `|re(z)| + |im(z)|`. Defined as a local `cabs1(v, idx)` helper on the Float64 view. No complex multiplication, division, or absolute value needed.
- No cmplx.js dependency required since CABS1 is safe to inline (just absolute value of real and imaginary parts, added together).
