# LEARNINGS: dtpsv

## Translation pitfalls
- dtpsv is the solve counterpart of dtpmv: uses subtraction/division instead of addition/multiplication.
- Upper no-transpose uses backward substitution (j from N-1 to 0), while lower no-transpose uses forward substitution (j from 0 to N-1). This is the opposite of dtpmv.
- The inner loop bounds use pointer arithmetic (`ip >= kk - j*strideAP`) rather than index-based bounds. This matches the Fortran reference closely but requires careful stride accounting.
- Negative stride requires computing offsetX = (N-1)*|stride| to point to the logical first element.

## Dependency interface surprises
- N/A (no external dependencies)

## Missing automation
- N/A

## Coverage gaps
- 100% line, branch, and function coverage achieved with 15 test cases covering all 8 uplo x trans x diag combinations, N=0, N=1, stride=2, negative stride, zero RHS elements, and lower transpose with stride=2.

## Complex number handling
- N/A (real-valued routine)
