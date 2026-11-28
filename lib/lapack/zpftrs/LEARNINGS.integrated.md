# zpftrs: Translation Learnings

## Overview
ZPFTRS solves A*X=B where A is complex Hermitian positive definite in RFP format, using the Cholesky factorization from ZPFTRF. It delegates entirely to ZTFSM (two triangular solves).

## Translation pitfalls

- The routine is trivially simple: just two calls to ztfsm. The main difficulty is getting the Fortran test correct so fixtures are reliable.
- For `uplo='lower'`: solve `L*Y=B` (trans='no-transpose'), then `L^H*X=Y` (trans='conjugate-transpose').
- For `uplo='upper'`: solve `U^H*Y=B` (trans='conjugate-transpose'), then `U*X=Y` (trans='no-transpose').

## Dependency interface surprises

- ZTFSM's `diag` is always `'non-unit'` (Cholesky factors are not unit-diagonal).
- ZTFSM's `side` is always `'left'` for zpftrs.
- The `transr` parameter passes through to `ztfsm` unchanged (controls RFP storage interpretation, not the operation on A).

## Automation opportunities

- The Fortran fixture generation for multi-column RHS (nrhs>1) requires manually packing B into a flat array since Fortran's column-major LDB>N layout doesn't map directly to the flat fixture format. A utility subroutine for this would help future routines.

## Coverage gaps

- All four TRANSR/UPLO combinations tested for both N=3 (odd) and N=4 (even), with nrhs=1 and nrhs=2. Also N=0 and N=1 edge cases.
- No negative-test for invalid inputs since base.js is @private and does not validate arguments.

## Complex number handling

- Only complex constant used is CONE=(1,0). No complex arithmetic in this routine -- all complexity is in ztfsm.

## Fortran test notes

- Used ZTRTTF to convert from full HPD matrix to RFP format, then ZPFTRF to factorize before solving with ZPFTRS.
- B must be passed with LDB=N and manually packed into flat double arrays, because EQUIVALENCE requires constant-size arrays and LDB>N padding corrupts multi-column fixtures.
- `deps_zpftrs.txt` needs transitive Fortran deps (zpotrf, zpotrf2, ilaenv, etc.) for compilation, even though the JS module only depends on ztfsm.
