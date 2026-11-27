# zsytrs_rook: Translation Learnings

## Translation pitfalls

- Structurally identical to non-rook `zsytrs`. The ONLY difference is that
  rook pivoting performs TWO row swaps per 2x2 pivot block (one for row k,
  one for row k+/-1) and BOTH `IPIV` entries of the block are negative.
- Symmetric (vs. Hermitian) means: NO conjugation anywhere. The 2x2 D solve
  uses `A(k-1,k-1)/AKM1K`, `A(k,k)/AKM1K`, `B(k-1,j)/AKM1K`, `B(k,j)/AKM1K`
  directly (the Hermitian variant would use `conj(AKM1K)` for the second
  term of each pair).
- The diagonal `A(k,k)` is fully complex (Hermitian forces real diagonal,
  symmetric does not). The 1x1 pivot uses `cDiv(1, 0, Av[diag], Av[diag+1])`.
- The back sweep uses `zgemv('transpose', ...)` (NOT
  `'conjugate-transpose'`) and there are NO `zlacgv` calls anywhere — the
  symmetric variant skips all of the conjugation wrapping that the
  Hermitian variant performs around its `zgemv` calls.

## Fortran IPIV → JS conversion

- Fortran 1-based positive `p` → JS 0-based `p - 1`.
- Fortran negative `-p` → JS `~(p-1) = -p` (numerically identical).

## Fixture strategy

- Same as `zhetrs_rook`: Fortran test prints `lda`, factored `A`,
  `IPIV`, input `b`, and solved `x`. JS test reconstructs and calls
  only `zsytrs_rook`.
- Fortran deps file needed `zsytrf_rook`, `zsytf2_rook`, `zlasyf_rook`,
  `zsyr` (NOT pulled by `deps.py`), `dlamch`, `ilaenv`, `ieeeck`,
  `iparmq` in addition to `zsytrs_rook` itself.

## Complex arithmetic

- The 2x2 D solve uses inlined `cDiv` (Smith algorithm) with module-level
  `cdR`/`cdI` to avoid allocation in the per-RHS loop. Pattern lifted
  from the existing `zsytrs` module.
