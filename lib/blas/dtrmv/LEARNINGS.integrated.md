# dtrmv: Translation Learnings

## Translation pitfalls

- [x] The Fortran source has separate code paths for INCX=1 vs INCX!=1 (with KX pointer logic). The stride/offset API consolidates these into a single path per (uplo x trans) combination since the offset captures the starting position and stride handles direction.
- [x] Negative stride handling: in Fortran, KX = 1 - (N-1)*INCX computes the start for negative strides. In JS, the caller provides offsetX directly pointing to the logical first element, so the implementation just uses offsetX + (N-1)*strideX to find the last element.
- [x] Four main code paths: (upper/lower) x (no-transpose/transpose). Each has distinct loop directions and index patterns. Upper no-transpose iterates columns forward; lower no-transpose iterates columns backward.

## Dependency interface surprises

- [x] None. DTRMV is self-contained with no BLAS/LAPACK dependencies.

## Automation opportunities

- [x] The real-valued dtrmv is structurally identical to the complex ztrmv minus the conjugate/interleaved logic. A template could generate both from the same specification.
- [x] The stride/offset consolidation of Fortran's INCX=1 vs INCX!=1 paths is a mechanical transformation applied to all BLAS level-2 routines.

## Coverage gaps

- [x] Achieved 100% line, branch, and function coverage with 10 tests covering all 4 main paths (upper/lower x N/T), unit vs non-unit diagonal, N=0, N=1, positive non-unit stride, and negative stride.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (ztrmv) is already implemented separately with interleaved Re/Im storage and conjugate-transpose support.
