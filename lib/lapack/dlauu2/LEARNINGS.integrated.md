# dlauu2: Translation Learnings

## Translation pitfalls

- The Fortran `DDOT(N-I+1, A(I,I), LDA, A(I,I), LDA)` for UPLO='U' takes a dot product along the row (columns i..N-1), so the stride for ddot is `sa2` (column stride), not `sa1`. For UPLO='L', the dot product is along the column, so stride is `sa1`.
- The `else` branch (i == N-1) uses `dscal` on the entire column/row (length N, not i), which differs from dgemv's `i` rows/cols. This matches Fortran exactly: when i == N-1 there are no off-diagonal elements to accumulate, just scale by the diagonal.
- The dgemv calls use different vectors for x depending on uplo: for 'U', x walks along the row (stride sa2); for 'L', x walks down the column (stride sa1). Getting these backwards silently produces wrong results.

## Dependency interface surprises

- `ddot(N, x, strideX, offsetX, y, strideY, offsetY)` -- standard 1D vector interface, no surprises.
- `dgemv(trans, M, N, alpha, A, sa1, sa2, offsetA, x, sx, ox, beta, y, sy, oy)` -- the x and y vector strides/offsets are separate from the matrix strides. Works naturally here.
- `dscal(N, da, x, strideX, offsetX)` -- standard 1D vector interface.

## Automation opportunities

- N/A. This was a straightforward translation with no mechanical steps beyond what the scaffold provides.

## Coverage gaps

- 100% line and branch coverage achieved. The i < N-1 vs i == N-1 split is the only branch, exercised by N=1 (only else) and N >= 2 (both paths).

## Complex number handling

- N/A. This is a real-valued (double precision) routine.
