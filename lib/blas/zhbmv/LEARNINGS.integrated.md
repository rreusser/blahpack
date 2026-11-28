# zhbmv: Translation Learnings

## Translation pitfalls

- Band indexing is the main challenge: understanding how the Fortran band storage
  maps to the JS stride-based indexing. The `l = kplus1 - j` (upper) and `l = -j`
  (lower) offsets from the Fortran directly translate because we use 0-based
  loop variables but compute band row as `l + i`.
- The Fortran `DBLE(A(KPLUS1,J))` extracts the real part of the diagonal.
  In JS, this is simply `Av[ia]` since we work on the Float64Array view
  where real/imag are interleaved, and the diagonal of a Hermitian matrix
  is real by definition.
- The `kx`/`ky` sliding window in the upper branch (advancing when `j >= K`)
  is easy to miss. It prevents accessing elements before the band's first
  column when the column index exceeds the bandwidth.

## Dependency interface surprises

- N/A -- zhbmv has no BLAS/LAPACK dependencies beyond standard library utilities.

## Automation opportunities

- The pattern of translating real-banded (dsbmv) to complex-banded (zhbmv) is
  highly mechanical: replace scalar arithmetic with complex multiply/conjugate
  patterns, add reinterpret, double all strides. This could be a transform
  in bin/transform.py.

## Coverage gaps

- 100% line coverage, 96.3% branch coverage achieved. The uncovered branches
  are minor short-circuit conditions in the quick-return logic that are hard
  to isolate (e.g., N=0 with specific alpha/beta combinations).

## Complex number handling

- All complex arithmetic is inlined (add, subtract, multiply, conjugate, real
  extraction). No cmplx library calls needed since zhbmv only uses addition,
  scalar multiplication, and conjugate -- all safe to inline.
- The conjugate pattern `conj(A(i,j)) * x(i)` expands to:
  `temp2R += aijR*xR + aijI*xI` and `temp2I += aijR*xI - aijI*xR`,
  which flips the sign of the imaginary part of A before multiplying.
- The diagonal is accessed as real-only (`Av[ia]`) since Hermitian matrices
  have real diagonals. The imaginary part at `Av[ia+1]` is ignored.
