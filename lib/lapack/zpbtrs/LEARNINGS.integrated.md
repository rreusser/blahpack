# zpbtrs: Translation Learnings

## Translation pitfalls

- Very simple routine: just a loop over NRHS calling ztbsv twice per column.
- Key difference from Fortran: ztbsv is called with complex-element strides and offsets. The column offset for the j-th RHS is `offsetB + j * strideB2`.
- For upper case: first solve U^H*y=b (trans='C'), then solve U*x=y (trans='N'). For lower case: first solve L*y=b (trans='N'), then solve L^H*x=y (trans='C').

## Dependency interface surprises

- ztbsv takes complex-element strides. The column vector stride is strideB1 (typically 1 for column-major), and the starting offset increments by strideB2 per RHS column.
- ztbsv modifies x in-place, so the same B array is used for both the forward and back substitution passes.

## Automation opportunities

- The dpbtrs -> zpbtrs translation is trivial: replace dtbsv with ztbsv, change 'Transpose' to 'C'. Could be fully automated.

## Coverage gaps

- 100% line and branch coverage achieved. Tests cover both UPLO='U' and 'L', single and multiple RHS, and N=0/NRHS=0 quick returns.

## Complex number handling

- No complex arithmetic in zpbtrs itself. All delegated to ztbsv.
