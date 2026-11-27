# LEARNINGS: dtbmv

## Translation pitfalls
- dtbmv is structurally identical to dtbsv but with multiply/add instead of divide/subtract. The transformation is mechanical: `x[jx] /= A[diag]` becomes `x[jx] *= A[diag]`, and `x[ix] -= temp * A[ia]` becomes `x[ix] += temp * A[ia]`.
- The transpose branches differ from no-transpose: no-transpose scatters (updates x[i] for i != j), while transpose gathers (accumulates into temp then writes to x[j]).
- The `kx` pointer tracking for non-unit-stride access differs between upper and lower, and between no-transpose and transpose. Each branch has its own kx update logic.

## Dependency interface surprises
- N/A (no external dependencies)

## Missing automation
- N/A

## Coverage gaps
- 100% line, branch, and function coverage achieved with 7 test cases covering all 4 uplo x trans branches, unit diagonal, N=0 edge case, and non-unit stride.

## Complex number handling
- N/A (real-valued routine)
