# ztgsyl: Translation Learnings

## Translation pitfalls

- Complex Schur form has only 1x1 diagonal blocks (no quasi-triangular 2x2 blocks like real case), so block partitioning is simpler -- no need to check for subdiagonal elements when building the partition.
- The Fortran ZTGSYL uses DCMPLX(SCALOC, ZERO) when calling ZSCAL, which translates to `new Complex128(scaloc, 0.0)` in JS.
- Unlike dtgsyl, the transposed branch uses `'conjugate-transpose'` instead of `'transpose'` for all ZGEMM calls.

## Dependency interface surprises

- ztgsy2 for the complex case has a simpler signature than dtgsy2 -- no IWORK or PQ output parameters. It returns info and uses Float64Array wrappers for scale/rdsum/rdscal.
- The Fortran deps file required extensive transitive dependencies (zladiv, la_constants, la_xisnan, zgeru, zswap) for compilation, even though they are not direct JS dependencies.

## Automation opportunities

- The scaffold generates Float64Array types in JSDoc for all matrices, but z-prefix routines use Complex128Array -- this could be auto-detected from the routine prefix.

## Coverage gaps

- The blocked path (mb < M or nb < N) is not exercised in tests since the test matrices are small (2x2, 3x3) and the block size is 32. This path is structurally identical to the unblocked path but uses submatrix offsets.
- IJOB=3 and IJOB=4 paths are not tested (they set ifunc and call zlaset to zero out C and F before solving).

## Complex number handling

- All scalar arguments to zgemm are Complex128 objects (CONE, CNEGONE, CZERO) defined as module-level constants.
- zscal takes a Complex128 for its scalar; when scaling by a real number, wrap as `new Complex128(scaloc, 0.0)`.
- zlaset takes Complex128 for alpha and beta parameters.
