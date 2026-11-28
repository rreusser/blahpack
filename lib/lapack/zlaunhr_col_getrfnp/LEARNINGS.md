# zlaunhr_col_getrfnp: Translation Learnings

## Translation pitfalls

- The Fortran reference uses `ILAENV( 1, 'ZLAUNHR_COL_GETRFNP', ... )` to
  pick the block size. Because `ilaenv.f` checks `SUBNAM(2:6).EQ.'LAORH'`,
  the substring `'LAUNH'` from `ZLAUNHR_COL_GETRFNP` does not match and
  `NB` defaults to `1`, meaning the reference implementation always falls
  through to the unblocked path. Whether this is a LAPACK bug or
  intentional, the JS port hardcodes `NB = 32` (matching the LAORHR path)
  so the blocked code is actually exercised. Outputs are identical to
  the Fortran reference on any input because both paths compute the same
  factorization.
- The Fortran loop `DO J = 1, MIN(M,N), NB; JB = MIN(MIN(M,N)-J+1, NB)`
  becomes `for ( j = 0; j < minMN; j += NB ) { jb = min(minMN - j, NB); }`
  in 0-indexed JS — make sure `j+jb` (the next column) is compared to
  `N` and `M` (not `N-1` / `M-1`) when deciding whether to apply
  `ZTRSM` / `ZGEMM` to the trailing submatrix.

## Dependency interface surprises

- `zlaunhr_col_getrfnp2`'s base is invoked with the same `(M, N, A,
  strideA1, strideA2, offsetA, D, strideD, offsetD)` ndarray-style
  signature, so the blocked driver simply offsets into `A` and `D` for
  each block: `oAjj = offsetA + j*strideA1 + j*strideA2`, etc.
- `ztrsm` and `zgemm` here use `'left'/'lower'/'no-transpose'/'unit'` and
  `'no-transpose'/'no-transpose'` respectively (same canonical
  string-flag names as the rest of the BLAS port).

## Complex number handling

- `D` is a `Complex128Array` of length `min(M,N)`. Each entry is
  `(+/-1, 0)` — the imaginary part is always zero because `D(i)` is
  defined as `-sign(Re(A(i,i)))`. The recursive kernel sets the imaginary
  part explicitly to `0.0`, so the blocked driver does not need to do any
  complex arithmetic on `D` itself.
- `CONE` and `CNEGONE` are reused as `Complex128(1, 0)` / `Complex128(-1, 0)`
  module-level constants for the BLAS-3 calls (no per-call allocation).
