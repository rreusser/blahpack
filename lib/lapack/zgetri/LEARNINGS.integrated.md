# zgetri: Translation Learnings

## Translation pitfalls

- WORK is Complex128Array, so all WORK indexing must account for complex elements. In the unblocked path, `WORK(I)` maps to `Wv[(offsetWORK + i*strideWORK)*2]` on the Float64Array view. In the blocked path, `WORK(I+(JJ-J)*LDWORK)` maps to `Wv[(offsetWORK + i + (jj-j)*ldwork)*2]`.
- The blocked path uses WORK as a 2D column-major workspace with strides (1, ldwork) in complex elements. This is passed to zgemm and ztrsm directly as a Complex128Array.
- The Fortran LWORK parameter becomes lwork in complex elements (not Float64 elements). The workspace size check uses `ldwork * nb` in complex elements.
- IPIV is 0-based in the JS convention. The pivot swap loop iterates `j = N-2; j >= 0; j--` (Fortran uses `J = N-1, 1, -1` which is 1-based).

## Dependency interface surprises

- zgemv takes Complex128 for alpha and beta scalars. Module-level constants CONE and CNEGONE avoid allocation in the inner loop.
- zswap takes Complex128Array with strides/offsets in complex elements, consistent with all other complex BLAS routines.
- When passing WORK to zgemm/ztrsm, the strides are (1, ldwork) in complex elements and the offset is offsetWORK + row_start.

## Missing automation

- The translation from dgetri to zgetri follows the same mechanical pattern as dtrtri->ztrtri: replace d-routines with z-routines, Float64Array with Complex128Array, real scalars with Complex128, and use Float64Array views for element access.
- The Fortran test pattern with EQUIVALENCE for complex arrays and subroutine-per-test-case could be templated in gen_test.py for complex LAPACK routines.

## Coverage gaps

- 100% line and branch coverage achieved with 9 tests: 3x3, 4x4, N=1, N=0, 3x3 with pivots, singular, 5x5 (unblocked), 35x35 (blocked), and 35x35 with insufficient workspace.

## Complex number handling

- No complex arithmetic is performed directly in zgetri; all operations are delegated to ztrtri, zgemv, zgemm, ztrsm, and zswap.
- Element copying between A and WORK uses Float64Array views (Av, Wv) for direct access to interleaved real/imag pairs.
- Complex zero assignment writes two zeros to the Float64Array view: `Av[ia] = 0.0; Av[ia+1] = 0.0`.
