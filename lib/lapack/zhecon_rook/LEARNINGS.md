# zhecon_rook: Translation Learnings

## Translation pitfalls

- Mechanical port from `zhecon`: only the inner solve swaps from `zhetrs`
  to `zhetrs_rook`. Reverse-communication with `zlacn2` is identical;
  `zlacn2` has no ISGN parameter (unlike `dlacn2`).
- Hermitian diagonal is always real, so the singular-D check inspects only
  the real component (`Av[ p1 ] === 0.0`) — don't compare against the full
  complex value.
- Fortran fixture must include the leading dimension (`lda`) when matrix
  is allocated as `A(NMAX, NMAX)` with NMAX > N: the JS test passes
  `strideA2 = lda` to step over column padding.

## Dependency interface surprises

- `zhetrs_rook(uplo, N, nrhs, A, sa1, sa2, oa, IPIV, sIPIV, oIPIV, B, sB1,
  sB2, oB)` — pass WORK column as B with `sB1=strideWORK`,
  `sB2=N*strideWORK`.
- `zlacn2(N, V, sV, oV, X, sX, oX, EST, KASE, ISAVE, ldx, oldx)` — no
  ISGN parameter.
- `Complex128Array` strides in `base.js` are in complex elements; multiply
  by 2 only when reading via reinterpret to inspect real parts.

## Process notes

- Fortran deps file needs the rook factorization chain (`zhetrf_rook`,
  `zhetf2_rook`, `zlahef_rook`) plus `zlanhe`/`zlassq`/`dlapy2` for the
  norm computation, and `dlamch` for safmin lookups.
- Lint-fix codemod will rewrite `zhecon_rook` -> `zheconRook` everywhere,
  including the require path in `main.js` — must hand-fix to point back
  to the actual filename `./zhecon_rook.js`.
