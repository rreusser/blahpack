# zhpmv: Translation Learnings

## Translation pitfalls

- Packed storage index arithmetic is simpler than 2D matrix indexing: `kk` advances by `(j+1)*sap` (upper) or `(N-j)*sap` (lower) per column. No strideA1/strideA2 decomposition needed since it is inherently 1D.
- The diagonal element in packed upper is at `kk + j*sap`, not `kk + j` -- must multiply by the Float64 stride to get the right position.
- The diagonal element in packed lower is at `kk` (start of each column segment), which is simpler than upper.

## Dependency interface surprises

- N/A. zhpmv has no BLAS/LAPACK dependencies beyond the standard Complex128 infrastructure (reinterpret, real, imag).

## Automation opportunities

- The dspmv (real) to zhpmv (complex) pattern is quite mechanical: every real multiply becomes a complex multiply (4 real ops), and the diagonal multiply uses only the real part. A "real-to-complex BLAS" transform could automate this for remaining packed/banded Hermitian routines.

## Coverage gaps

- N/A. Achieved 100% line, branch, and function coverage.

## Complex number handling

- Diagonal elements of Hermitian matrices are guaranteed real, so we only read `APv[kk]` (the real part) and skip the imaginary part. This avoids a multiply by zero.
- Off-diagonal: accumulate `conj(AP[k]) * x[i]` by flipping the sign on the imaginary part of AP when computing the dot product contribution to temp2.
- The beta scaling uses the standard complex multiply pattern: `(betaR*yr - betaI*yi, betaR*yi + betaI*yr)`.
