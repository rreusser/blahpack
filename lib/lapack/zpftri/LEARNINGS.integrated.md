# zpftri: Translation Learnings

## Translation pitfalls

- zpftri is structurally identical to the real dpftri, but with complex data types (Complex128Array) and Hermitian operations (zherk with conjugate-transpose) instead of symmetric operations (dsyrk with transpose).
- The Fortran code uses `DOUBLE PRECISION ONE` and `COMPLEX*16 CONE` as separate constants. In the JS translation, zherk takes real scalars (plain numbers) for alpha/beta, while ztrmm takes a Complex128 for alpha. Mixing these up would be a subtle bug.
- Array offsets in the Fortran use 0-based indexing (`A(0:*)`), which maps directly to the ndarray offset convention. Each offset like `A(N1)` becomes `offsetA + (sa * n1)` in complex element units.

## Dependency interface surprises

- zherk uses 2D ndarray strides (strideA1, strideA2, strideC1, strideC2) and real scalars for alpha/beta, not Complex128.
- ztrmm uses 2D ndarray strides and a Complex128 scalar for alpha.
- zlauum uses 2D ndarray strides (strideA1, strideA2) and returns an info integer.
- ztftri has an extra `diag` parameter ('unit'/'non-unit') that zpftri always passes as 'non-unit'.

## Automation opportunities

- The 8-branch structure (2 parity x 2 transr x 2 uplo) is identical between dpftri and zpftri. A template-based generator could produce the complex variant from the real one by substituting routine names and constant types.

## Coverage gaps

- All 8 TRANSR/UPLO/parity branches are covered by fixture tests (N=3 odd, N=4 even, N=5 larger odd).
- The ztftri early return path (info > 0 from singular factor) is not directly tested since fixtures start with known HPD matrices. This path is exercised by ztftri's own tests.

## Complex number handling

- zpftri does not perform any direct complex arithmetic. It is purely a dispatch routine that partitions the RFP array and calls ztftri, zlauum, zherk, and ztrmm with appropriate offsets, strides, and parameters.
- No reinterpret or manual Float64Array access is needed since all complex operations are delegated to the dependency routines.
