# dlarra: Translation Learnings

## Translation pitfalls

- NSPLIT is a scalar output parameter. Following the dstebz pattern, it is passed as `Int32Array(1)` and written to `nsplit[0]`.
- ISPLIT values remain 1-based (matching Fortran convention), consistent with how dstebz stores and reads ISPLIT values. The final entry stores `N` (the matrix order).
- The `spltol < 0` branch uses only `e` and `tnrm`, while `spltol >= 0` also indexes `d`. Ensure `id` pointer only advances in the relative-accuracy branch.

## Dependency interface surprises

- N/A: dlarra has no BLAS/LAPACK dependencies (leaf routine).

## Automation opportunities

- The signature tool generates `{integer} nsplit` for scalar output params, but they must be `{Int32Array}` passed as length-1 arrays. Consider auto-detecting Fortran `OUT` integer scalars and generating the correct type.

## Coverage gaps

- N/A: 100% line and branch coverage achieved. The routine is simple with only two code paths (absolute vs relative threshold).

## Complex number handling

- N/A: dlarra is a real-valued routine.
