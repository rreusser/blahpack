# dorg2l: Translation Learnings

## Translation pitfalls

- The main difference from dorg2r is the column ordering: identity columns go
  in columns 0..N-K-1 (instead of K..N-1), and reflectors are applied in
  forward order (i=0..K-1) instead of reverse order.
- Diagonal placement for identity columns is at row M-N+j (0-based), not row j.
  This is because in QL, the lower-right triangle contains R, so the "identity"
  part of Q spans the upper-left portion.
- The Fortran index II = N-K+I (1-based) maps to ii = N-K+i (0-based), and the
  row count for the reflector is M-N+ii+1 (converting the Fortran count M-N+II).
- Fixture data from `print_matrix` stores M rows per column (dense, no LDA
  padding). When loading into a buffer with LDA > M, must unpack column-by-column
  rather than using a simple `A.set(data)`. This caused initial test failures.

## Dependency interface surprises

- dlarf takes the reflector vector as (array, stride, offset) separately from the
  matrix C which is (array, strideC1, strideC2, offsetC). The tau parameter is a
  scalar, not an array reference. No surprises here compared to dorg2r usage.
- dscal takes (N, da, x, strideX, offsetX) -- straightforward.

## Automation opportunities

- The `loadMatrix(data, M, N, LDA)` helper for unpacking fixture data into LDA-
  padded buffers is needed in many tests. Could be extracted into a shared test
  utility.

## Coverage gaps

- 100% line and branch coverage achieved. All code paths exercised: N<=0 quick
  return, K=0 identity-only path, K<N partial reflectors, K=N full reflectors,
  non-unit strides, and non-zero offsets.

## Complex number handling

- N/A (real-valued routine)
