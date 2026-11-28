# zla_porcond_x: Translation Learnings

## Translation pitfalls

- Structurally identical to `zla_hercond_x` except the factorization is Cholesky
  (`zpotrf` / `zpotrs`) rather than Bunch-Kaufman, so there is no `IPIV` and no
  special 0-based/tilde-encoded pivot conversion in tests.
- The Fortran quick-return order is subtle: `N==0` is checked AFTER the
  anorm-building loop. A loop from `1..N` when `N==0` is a no-op in Fortran,
  so reordering the check (return 1.0 on `N==0` up front) is safe in JS.

## Dependency interface surprises

- `zpotrs( uplo, N, nrhs, AF, sAF1, sAF2, offAF, B, sB1, sB2, offB )`. The WORK
  vector is passed as the `B` matrix with strideB1=strideWORK, strideB2=N*strideWORK,
  offsetB=offsetWORK — mirrors the hercond_x pattern.
- `zlacn2` reverse communication: `KASE`/`EST`/`ISAVE` are typed-array containers,
  WORK is used as both V and X columns offset by `N*strideWORK`.

## Complex number handling

- The row-norm accumulates `CABS1(A(i,j)*X(j))` — CABS1 on the complex
  PRODUCT, not `|A|*|X|`. Hoist the product real/imag then sum abs values.
- For the KASE==1/2 loops, `cmplx.divAt` is the correct robust
  indexed complex division (never inline).
- Real-by-complex multiplication `wv[iw] *= RWORK[ir]` is safe to inline
  (RWORK is real, so no cross-term).

## Test fixture

- Used `ZPOTRF` pre-factored input with diagonally-dominant Hermitian
  pos-def 4x4 matrices (diagonal 10..16) so that Cholesky does not fail.
- Added `disnan`, `dlaisnan`, `zpotrf`, `zpotrf2` to `deps_zla_porcond_x.txt`
  for Fortran link: `deps.py` does not trace the `ZPOTRF → DISNAN` path
  because ZPOTRF is only a test dependency (not a runtime dep of zla_porcond_x).
