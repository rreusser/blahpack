# zhpgvx: Translation Learnings

## Translation pitfalls

- The Fortran uses `TRANS = 'C'` (conjugate-transpose) for the complex backtransform, whereas the real counterpart dspgvx uses `TRANS = 'T'` (transpose). The JS translation must use `'conjugate-transpose'` instead of `'transpose'` for the ztpsv/ztpmv calls.
- The `M` output parameter uses the `out.M` object pattern (same as dspgvx and zhpevx), not a positional parameter.

## Dependency interface surprises

- zpptrf, zhpgst, zhpevx all accept Complex128Array with complex-element strides/offsets (not Float64 strides). The ztpsv and ztpmv BLAS routines also use complex-element addressing.
- zhpevx takes an `out` object for the M parameter and returns info, matching the same pattern as dspevx.

## Automation opportunities

- The gen_test.py scaffold produces empty test stubs for complex routines. The complex fixture comparison (comparing magnitudes vs individual re/im components) should be built into the generator.

## Coverage gaps

- The test uses 3x3 Hermitian matrices for most cases. A 4x4 test would improve coverage but the 3x3 tests cover all itype/jobz/range/uplo combinations.
- Only real-diagonal B matrices were tested; a B with complex off-diagonal entries would exercise zpptrf more thoroughly.

## Complex number handling

- zhpgvx itself does not perform any complex arithmetic directly; it delegates entirely to zpptrf, zhpgst, zhpevx, ztpsv, and ztpmv.
- No reinterpret() needed in base.js since the routine is purely a driver that dispatches to its dependencies.
- Test comparisons use complex magnitudes (sqrt(re^2 + im^2)) rather than per-component abs() to handle eigenvector phase ambiguity.
