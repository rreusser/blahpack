# dspmv: Translation Learnings

## Translation pitfalls

- The Fortran dspmv uses packed storage where the array AP stores either the
  upper or lower triangle sequentially, column by column. The key difference
  from dsymv is that AP is indexed sequentially (no 2D strides), so a KK
  pointer tracks the start of each column's packed segment.
- Initial implementation incorrectly computed start points for negative strides
  using `kx = offsetX + (N-1)*strideX`. In the stdlib-js convention, the caller
  already computes the correct starting offset, so `kx = offsetX` is correct
  regardless of stride sign. This caused NaN failures until fixed.
- The Fortran stride-1 specialization (separate INCX=1/INCY=1 code paths) was
  dropped in favor of a single general path, matching the dsymv approach.

## Dependency interface surprises

- N/A: dspmv is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A: straightforward translation using existing patterns from dsymv.
  The init_routine.py scaffold worked correctly for this packed-storage routine.

## Coverage gaps

- 100% line and branch coverage on base.js. All parameter combinations tested:
  UPLO='upper' and 'lower', alpha=0/1/2, beta=0/0.5/1/2/3, N=0/1/3/4,
  unit/non-unit/negative strides.

## Complex number handling

- N/A: dspmv is a real-valued (double precision) routine.
