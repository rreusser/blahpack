# zhegs2: Translation Learnings

## Translation pitfalls

- Key difference from dsygs2: the upper/itype=1 path requires ZLACGV calls to conjugate rows before/after ZAXPY and ZTRSV operations. Fortran source has paired ZLACGV calls (conjugate, operate, unconjugate) that must be preserved exactly.
- ZTRSV uses 'conjugate-transpose' (not 'transpose') in the upper/itype=1 path, matching the Hermitian inv(U^H) operation.
- CT = -HALF*AKK is a real scalar but must be wrapped as Complex128 for zaxpy (which expects Complex128 alpha).
- Diagonal elements AKK, BKK are read from Float64 view (real part only) since Hermitian diagonal is always real. Must set imag to 0 after writing back.

## Dependency interface surprises

- zaxpy expects Complex128 for the scalar `za`, even when the value is purely real (like CT = -0.5*akk). Must wrap in `new Complex128(val, 0.0)`.
- The lower/itype=2,3 paths use ZLACGV on row vectors (stride=sa2), conjugating before ZTRMV and unconjugating after. This pattern is specific to the Hermitian case and absent in dsygs2.

## Automation opportunities

- The dsygs2-to-zhegs2 transformation is systematic: replace DSCAL->ZDSCAL, DAXPY->ZAXPY, DSYR2->ZHER2, DTRMV->ZTRMV, DTRSV->ZTRSV, add ZLACGV pairs in upper path, change 'transpose' to 'conjugate-transpose'. Could be described as a rule.

## Coverage gaps

- 100% line and branch coverage achieved.

## Complex number handling

- All BLAS calls handle complex arithmetic internally. The only direct element access is for diagonal values (real-only read/write via Float64 view).
- NEGCONE = (-1, 0) and CONE = (1, 0) are module-level constants to avoid per-call allocation.
