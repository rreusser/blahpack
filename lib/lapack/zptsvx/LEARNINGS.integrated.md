# zptsvx: Translation Learnings

## Translation pitfalls

- Fortran ZPTSVX calls DCOPY for the real diagonal D and ZCOPY for the complex off-diagonal E. In the JS version, dcopy uses Float64Array strides/offsets while zcopy uses Complex128Array (complex-element) strides/offsets. Mixing them up would silently corrupt data.
- The Fortran source passes 'Lower' to zpttrs and zptrfs. This maps to 'lower' in the JS convention (stdlib uses lowercase string enums).

## Dependency interface surprises

- zptcon takes `anorm` as a scalar number, not an array. This is unlike most other output parameters.
- zpttrf takes D (Float64Array) and E (Complex128Array) with different stride semantics. D strides are in real elements; E strides are in complex elements. This matches the established convention.
- zptrfs requires both WORK (Complex128Array) and RWORK (Float64Array) workspaces. The Fortran signature has both but the signature checker expects fewer params (warns about 36 vs 30).

## Automation opportunities

- The b vectors in Fortran tests are computed as A*x_true. A small utility to compute Hermitian tridiagonal matvec would avoid manual calculation errors in future complex driver tests.

## Coverage gaps

- None significant. All branches covered: factored/not-factored paths, N=0 quick return, N=1 scalar case, not-positive-definite early exit, multi-RHS, and standard solve paths.

## Complex number handling

- D and DF are always real (Float64Array), even though this is a complex routine. E, EF, B, X, WORK are Complex128Array. RWORK, FERR, BERR, rcond are Float64Array.
- No complex arithmetic is needed in zptsvx itself; all complex math is delegated to the subroutines (zpttrf, zpttrs, zptrfs, zptcon, zlanht, zlacpy, zcopy).
