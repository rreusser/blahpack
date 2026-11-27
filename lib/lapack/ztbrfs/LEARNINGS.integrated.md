# ztbrfs: Translation Learnings

## Translation pitfalls

- Band storage row indexing requires careful Fortran 1-based to JS 0-based conversion. For upper triangular with KD superdiagonals, the diagonal is at row KD (0-based), not row KD+1. The Fortran formula AB(KD+1+I-J, J) maps to 0-based row (kd+i-j), col j.
- The CABS1 function (|re|+|im|) is a Fortran statement function that must be implemented as a helper. It operates on the Float64 reinterpret view, not on Complex128 elements directly.
- The TRANS parameter in the Fortran source accepts 'N', 'T', and 'C' but for complex matrices, 'T' and 'C' follow the same code path. In stdlib-js, only 'no-transpose' and 'conjugate-transpose' are used.

## Dependency interface surprises

- zlacn2 uses reverse communication with Int32Array KASE and Float64Array EST as in/out parameters. The V workspace must be at WORK offset N (not separate array).
- ztbmv and ztbsv take complex-element strides and offsets, matching the Complex128Array convention.
- zaxpy requires a Complex128 scalar, not a plain number. Used CNEGONE = Complex128(-1, 0).

## Automation opportunities

- The Fortran test setup pattern (set up band matrix, solve with ztbtrs, then call ztbrfs) is identical across all *rfs routines and could be templated.

## Coverage gaps

- The safe2 threshold path (where RWORK values are small) is not exercised by the current test data since well-conditioned matrices produce large denominators.
- TRANS='transpose' (non-conjugate) is not directly tested because stdlib-js only supports 'no-transpose' and 'conjugate-transpose'.

## Complex number handling

- All complex arithmetic is done through BLAS/LAPACK dependencies (zcopy, zaxpy, ztbmv, ztbsv, zlacn2). No inline complex arithmetic needed.
- CABS1 (|re|+|im|) is used throughout for componentwise error bounds, implemented as a helper function operating on Float64 views.
- Real-times-complex multiplication (RWORK * WORK) is done component-wise on the Float64 view: multiply both re and im parts by the real scalar.
