# dsyswapr: Translation Learnings

## Translation pitfalls

- `dsyswapr` is deceptively tricky: it does NOT simply swap row `i1` with row
  `i2` (and then column `i1` with column `i2`). Because only one triangle of
  the symmetric matrix is stored, the block strictly between `i1` and `i2`
  must swap the *row* slice at index `i1` with the *column* slice at index
  `i2` (or the opposite, for lower storage). This is because the stored
  representative of symmetric entry `(k, i1)` for `i1 < k < i2` lives at
  position `(i1, k)` in upper storage but at position `(k, i1)` in lower
  storage — the storage side flips across the diagonal.
- The four blocks for UPLO='U' with `i1 < i2`:
  1. Columns `i1` and `i2`, rows `0..i1-1` (both columns proper, stride = strideA1).
  2. Diagonals `(i1,i1)` and `(i2,i2)` (single scalar swap).
  3. Row `i1` cols `i1+1..i2-1` (stride = strideA2) vs column `i2` rows
     `i1+1..i2-1` (stride = strideA1) — the cross-block.
  4. Row `i1` cols `i2+1..N-1` vs row `i2` cols `i2+1..N-1` (both stride = strideA2).
  UPLO='L' is the exact mirror with strideA1 and strideA2 exchanged throughout.
- The routine has no explicit quick-return for `i1 === i2`. In that case
  `n1 = i1`, `n2 = -1`, `n3 = N-1-i1`, and `dswap` with negative `N` is a
  no-op; the diagonal swap is its own inverse. We relied on that behavior
  rather than adding a special case.

## Dependency interface surprises

- Used the `ndarray`-style signature of `dswap(N, X, sX, oX, Y, sY, oY)`
  from `lib/blas/base/dswap/lib/base.js`. The base export is the ndarray
  form, so the strides and offsets translate directly from Fortran
  `A(r, c)` addresses as `offsetA + r*strideA1 + c*strideA2`.
- `dswap` gracefully accepts `N <= 0`, which lets us pass `n2 = i2-i1-1`
  and `n1 = i1` without guarding for zero/negative lengths.

## API convention

- `i1` and `i2` are zero-based (matching `dlaswp`'s 0-based `k1`/`k2`),
  not the 1-based `I1`/`I2` of the Fortran reference. Tests and the
  Fortran fixture generator subtract 1 when converting.
