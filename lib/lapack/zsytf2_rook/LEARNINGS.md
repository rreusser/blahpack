# zsytf2_rook: Translation Learnings

## Translation pitfalls

- Complex SYMMETRIC (not Hermitian) rook factorization. Unlike
  `zhetf2_rook`, there is NO conjugation during swaps and diagonal
  entries remain fully complex (no forced-real step).
- Structurally identical to `dsytf2_rook` but with complex arithmetic
  throughout: `d11`, `d12`, `d21`, `d22`, `t`, `wk`, `wkm1` are ALL
  complex scalars.
- `absakk`, `colmax`, `rowmax` use `cabs1 = |re| + |im|` (L1 norm),
  which is the BLAS convention for complex magnitude in pivot searches.
  Do not confuse with `|z|` (L2).
- The `sfmin` test uses `cabs1(A(k,k)) >= sfmin`.
- Rank-1 update calls `zsyr` (complex symmetric, transpose update),
  NOT `zher` (Hermitian, conjugate-transpose). Alpha is complex:
  `new Complex128( -r1R, -r1I )`.
- `zscal` takes a complex scalar (wrap in `new Complex128`); `zdscal`
  would be wrong here (that's for Hermitian routines).
- IPIV 2x2 encoding: `IPIV[k] = ~p`, `IPIV[k-1] = ~kp` (upper) — each
  entry its own swap target.

## Dependency interface surprises

- `zsyr` is in `lib/lapack/base/zsyr/` (not `lib/blas/base/`) because
  LAPACK provides it, not Reference BLAS.
- `zscal`/`zsyr` accept `Complex128` objects for scalar args, so the
  callers allocate fresh `new Complex128(...)` at each call. Could be
  hoisted out of the hot loop for performance later.

## Complex number handling

- Used a local `cDiv` helper with Smith's method (re-used from `zsytf2`
  for consistency) to handle complex division without allocating
  `Complex128` objects. Results go into module-level `cdR`/`cdI`.
- Inline complex multiplications for the rank-2 update inner loop.
  cDiv is only called for the outer loop setup and for `A(i,k)/D12`
  inside the inner loop (since those ARE complex divisions). This is
  expensive but matches Fortran semantics exactly.
- The 2x2 rank-2 inner loop calls `cDiv` 2x per (i,j) — a potential
  hot-spot for future optimization.

## Testing notes

- Same `extractSubmatrix` helper as `zhetf2_rook` handles Fortran
  LDA-strided fixture output.
- For IPIV conversion, negative Fortran values pass through unchanged
  (`-p` matches JS `~(p-1)` numerically).
