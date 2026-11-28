# zla_porcond_c: Translation Learnings

## Translation pitfalls

- Fortran loop bound `DO J = 1, I` includes `I`, so the 0-based JS port
  must use `j <= i` (not `j < i`). The `dla_porcond` real analog uses
  the same pattern. The `zla_hercond_c` sibling shows the same half-split
  but writes it as `j < i` plus `j >= i`; both conventions are valid.
- Unlike `zla_hercond_c`, this routine uses `zpotrs` + `zpotrf` (Cholesky)
  rather than `zhetrs` + `zhetrf` (Bunch-Kaufman), so there is **no IPIV
  parameter**. The signature generator still produces the standard
  ndarray pattern with stride1/stride2/offset for `A` and `AF`.

## Dependency interface surprises

- `zpotrs(uplo, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB)`
  has separate `strideB1`/`strideB2` even for vector RHS (nrhs=1); pass
  `strideWORK` and `N*strideWORK` respectively when the RHS is a single
  column stored in `WORK[0..N-1]`.
- `zlacn2` takes `(N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE)`;
  initialize `KASE[0]=0`, `EST[0]=0.0`, all `ISAVE` entries to 0 before the loop.

## Complex number handling

- `CABS1(z) = |Re(z)| + |Im(z)|` (NOT the true modulus). Because
  `CABS1(conj(z)) === CABS1(z)`, the norm computation only needs the
  stored triangle — mirror entries yield the same contribution.
- The Hermitian diagonal is real, so the diagonal `CABS1` reduces to
  `|Re(A[i,i])|`, but reading both components (with `Math.abs` on the
  imaginary part being a no-op when exactly zero) keeps the code uniform
  with `zla_hercond_c`.

## Fortran test

- `ZPOTRF` requires a genuinely positive-definite matrix. Used a
  diagonally dominant Hermitian matrix with real diagonal entries
  `{6, 7, 8}` to guarantee factorization succeeds.
- Matches the test pattern from `test_zla_hercond_c.f90`: `NMAX=N=3` so
  the EQUIVALENCE stride for printing complex matrices as Float64 pairs
  does not skip padding rows.
