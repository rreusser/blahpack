# zsytri_rook: Translation Learnings

## Translation pitfalls

- Structurally a clean port of `zsytri` with the rook variant's two-step
  pivot interchange for 2x2 blocks (each entry of `IPIV` for the block
  encodes its own swap target via bitwise NOT). The element-wise
  conjugation loop seen in zhetri_rook does NOT apply here because
  symmetric mirror reads do not conjugate; the row swap collapses to a
  single `zswap(K-KP-1, ..., LDA)` call (just like dsytri_rook).
- Diagonal of inverse is FULL complex (no zeroing of imaginary parts) -
  this is the key difference vs Hermitian. 1x1 inversion is a complex
  reciprocal: use a numerically stable Smith-formula `cdivInPlace`
  (copied from zsytri).
- 2x2 inversion requires complex multiplications and divisions in the
  formulas `T = A(k,k+1)`, `AK = A(k,k)/T`, `AKP1 = A(k+1,k+1)/T`,
  `AKKP1 = A(k,k+1)/T`, `D = T*(AK*AKP1 - 1)`. All temporary scalars
  must be tracked as `(R, I)` pairs; the helper `cdivTo` writes results
  into module-level `cdivR`/`cdivI` to avoid Complex128 allocations.
- Uses `zdotu` (non-conjugating) and `zsymv` (symmetric matvec). NOT
  `zdotc` or `zhemv`. The dot result is subtracted from the diagonal as
  full complex (`Av[p] -= real(dotu); Av[p+1] -= imag(dotu);`).

## Dependency interface surprises

- `zsymv` is provided by `lib/lapack/base/zsymv` (not BLAS) since BLAS
  has no symmetric-complex matvec. This matched the pattern used in
  zsytri.
- `zsyr` is required transitively by `zsytf2_rook` for the Fortran
  fixture compilation; missing it gave linker errors. Added to
  `deps_zsytri_rook.txt`.

## Coverage / test notes

- All paths reached by the same fixture set as zhetri_rook (1x1, 3x3,
  4x4 indef forcing 2x2 blocks, 4x4 swap with mixed pivots, plus
  hand-written 2x2 singular cases for `info > 0` branches in upper and
  lower).
