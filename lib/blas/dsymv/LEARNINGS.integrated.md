# dsymv: Translation Learnings

## Translation pitfalls

- The Fortran has stride-1 specializations (INCX=1 and INCY=1 paths) which
  were dropped in the JS implementation in favor of a single general path
  using stride/offset, following the dgemv pattern. No correctness impact.
- The symmetry exploitation pattern (accumulating both y[i] += temp1*A[i,j]
  and temp2 += A[i,j]*x[i] in the same inner loop) must be preserved exactly.
  Reordering these operations or splitting them into separate loops would be
  incorrect because they use different index traversals.
- When setting up Fortran test fixtures with non-unit strides, elements at
  indices beyond the matrix dimensions (e.g., a(10), a(11) for a 3x3 matrix
  with LDA=3) are never accessed by dsymv and are irrelevant noise.

## Dependency interface surprises

- N/A: dsymv is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A: straightforward translation using existing patterns from dgemv.

## Coverage gaps

- 100% line and branch coverage achieved. All parameter combinations tested:
  UPLO='U' and 'L', alpha=0/1/2, beta=0/0.5/1/2/3, N=0/1/3/4,
  unit/non-unit/negative strides.

## Complex number handling

- N/A: dsymv is a real-valued (double precision) routine.
