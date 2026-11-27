# zsycon_rook: Translation Learnings

## Translation pitfalls

- Mechanical port from `zsycon`: only the inner solve swaps from `zsytrs`
  to `zsytrs_rook`. Reverse-communication with `zlacn2` is identical.
- Unlike `zhecon_rook` (Hermitian), the singular-D check on the diagonal
  must compare BOTH real AND imaginary parts to zero
  (`Av[ia] === 0.0 && Av[ia+1] === 0.0`). Complex symmetric matrices have
  fully complex diagonals.

## Dependency interface surprises

- `zsytrs_rook(uplo, N, nrhs, A, sa1, sa2, oa, IPIV, sIPIV, oIPIV, B,
  sB1, sB2, oB)` — same calling convention as `zhetrs_rook`.
- `zlacn2(N, V, sV, oV, X, sX, oX, EST, KASE, ISAVE, ldx, oldx)` — no
  ISGN parameter (unlike `dlacn2`).

## Process notes

- Fortran deps file needs `zsyr` (used by `zsytf2_rook`) — this is a
  surprise because `zsyr` is a level-2 BLAS-like routine that lives in
  the LAPACK SRC tree. Without it, the linker complains about
  `zsyr_` being undefined.
- Other deps: `zsytrf_rook`, `zsytf2_rook`, `zlasyf_rook`, `zlansy`,
  `zlassq`, `dlapy2`, `dlamch`.
