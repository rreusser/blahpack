# zla_hercond_x: Translation Learnings

## Translation pitfalls

- The Hermitian row-sum for the infinity norm accesses `A(j,i)` for `j<=i`
  and `A(i,j)` for `j>i` in the upper path (mirrored in the lower path).
  For the CABS1 absolute value, conjugation is a no-op (|conj(z)| = |z|),
  so no conjugation is needed when reading across the diagonal — unlike the
  actual matvec case.
- `zla_hercond_x` is self-adjoint: the call to `zhetrs` uses the same `uplo`
  regardless of whether zlacn2 returned KASE=1 or KASE=2, since op(A) = A
  and op^H(A) = A for Hermitian A (this differs from `zla_gercond_x` where
  the solver alternates between `'no-transpose'` and `'conjugate-transpose'`).
- Fortran test must pack `AF` into a contiguous `n*n` buffer before
  `print_array` — otherwise the fixture reads NMAX-stride padding and
  produces silently corrupt factorizations.

## Dependency interface surprises

- `zhetrs` uses 0-based `IPIV` with bitwise NOT for 2x2 pivots; the test
  helper `toIPIV` converts Fortran 1-based pivots (`-p` for 2x2) via
  `~((-p) - 1)` which equals `-p` — matching the stored raw value.
- `zlacn2` has no ISGN parameter (unlike `dlacn2`); signature is
  `(N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE)`.

## Complex number handling

- `CABS1(A(i,j) * X(j))` is computed on the complex product (not
  `|A(i,j)| * |X(j)|`). The product is expanded inline
  (`prodR = ajR*xjR - ajI*xjI`, `prodI = ajR*xjI + ajI*xjR`) then summed
  with `Math.abs(prodR) + Math.abs(prodI)`.
- The WORK/X division in the reverse-communication loop uses `cmplx.divAt`
  for numerical stability (Baudin-Smith). Never inline complex division.
