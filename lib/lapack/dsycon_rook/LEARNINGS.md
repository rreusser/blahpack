# dsycon_rook: Translation Learnings

## Translation pitfalls

- Structurally identical to `dsycon`: only the inner solve call swaps from
  `dsytrs` to `dsytrs_rook`. The reverse-communication pattern with `dlacn2`
  is exactly the same (KASE state machine, V/X/ISGN partitioning of WORK).
- `dsytrf_rook` is not yet ported to JS, so the JS test cannot factor in
  process. Fortran fixtures must print the factored A and IPIV directly,
  and the JS test ingests them via `convertIpiv` (Fortran 1-based -> JS
  0-based) for direct consumption by `dsycon_rook`.
- Negative IPIV entries (rook 2x2 pivots) are kept as-is when converting
  from Fortran to JS — the bitwise-NOT encoding is identical.

## Dependency interface surprises

- `dsytrs_rook` has the canonical `(uplo, N, nrhs, A, sa1, sa2, oa, IPIV,
  sIPIV, oIPIV, B, sB1, sB2, oB)` ndarray signature; passing the WORK
  vector as a 1-column matrix uses `strideB1=strideWORK`,
  `strideB2=N*strideWORK`.
- `dlacn2`'s V vector lives at `WORK[N..2N-1]` and X at `WORK[0..N-1]`.
  Use offset `offsetWORK + N*strideWORK` for V; share `IWORK` as ISGN.

## Process notes

- The scaffolded dsycon_rook.js wrapper has no analog in the older dsycon
  (which lacks the order/layout parameter). Match the newer scaffolded
  pattern (15-arg layout wrapper) for consistency.
- Benchmark scaffolds default to N=10^3 with `N*N` allocation; reduced to
  10^2 to avoid the OOM trap noted in MEMORY.md.
- Fortran test compilation needs `dlamch` in deps file (transitive
  dependency through `dsytf2_rook`/`dlasyf_rook`).
