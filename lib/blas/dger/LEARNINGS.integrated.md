# dger: Translation Learnings

## Translation pitfalls

- [x] The Fortran source has separate code paths for INCX=1 vs INCX!=1 (with KX start computation). The stride/offset API collapses these into a single loop since offsetX captures the starting position directly.
- [x] For negative INCY in Fortran, JY = 1 - (N-1)*INCY computes the start. In JS, the caller provides offsetY pointing to the logical first element, so the implementation just walks with strideY from offsetY.
- [x] The y[jy] !== 0 guard skips entire column updates when the y element is zero, which is critical for sparse vectors. This is not just optimization but matches the Fortran structure.

## Dependency interface surprises

- [x] None. DGER is self-contained.

## Automation opportunities

- [x] The Fortran INCX=1 vs INCX!=1 split is unnecessary in the stride/offset API. This consolidation is mechanical and applies to all BLAS level-2 routines.
- [x] DGER is the real equivalent of ZGERC/ZGERU. The complex versions add conjugation logic but the structure is identical.

## Coverage gaps

- [x] Achieved 100% coverage with 8 tests: basic, alpha=2, additive update, alpha=0 quick return, M=0, N=0, non-unit stride, and negative stride.

## Complex number handling

- [x] N/A. Real-valued only. Complex equivalents ZGERC (conjugated y) and ZGERU (unconjugated y) already exist.
