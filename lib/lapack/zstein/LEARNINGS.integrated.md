# zstein: Translation Learnings

## Translation pitfalls

- zstein is structurally identical to dstein except for the output Z being Complex128Array. All the inverse iteration and factorization are done in real arithmetic (double precision WORK arrays).
- The reorthogonalization in Fortran uses `DBLE(Z(B1-1+JR, I))` to extract the real part of the complex eigenvector. In JS, this means reading `zv[oz + (b1+jr)*sz1 + i*sz2]` (the real part at even index) from the Float64 view.
- Same ISPLIT/IBLOCK 1-based indexing pitfalls as dstein.

## Dependency interface surprises

- zstein uses only real BLAS/LAPACK deps (dcopy, dscal, dnrm2, idamax, dlagtf, dlagts, dlarnv). No complex BLAS at all -- the only complex aspect is storing real eigenvectors into a Complex128Array.
- Unlike dstein which uses ddot and daxpy for reorthogonalization, zstein does the dot product and axpy manually (extracting real parts from complex Z). This is because the standard BLAS zdotc/zaxpy would operate on complex types unnecessarily.

## Automation opportunities

- zstein and dstein share 95% of their code. A template approach could generate both from a single source with a complex/real toggle.

## Coverage gaps

- Same as dstein: error validation, convergence failure, and some reorthogonalization edge cases not fully covered.
- The 78% branch coverage is due to untested error paths (N < 0, M > N, bad ordering).

## Complex number handling

- Z is Complex128Array. Strides are in complex elements. At function entry, `reinterpret(Z, 0)` gives Float64Array view, and strides are multiplied by 2.
- Eigenvectors are purely real: imaginary parts are explicitly set to 0.0 when storing.
- No complex arithmetic is performed -- all computation uses real-valued WORK arrays.
