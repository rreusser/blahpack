# zla_hercond_c: Translation Learnings

## Translation pitfalls

- Structurally near-identical to `zla_gercond_c`, but with a `UPLO`
  parameter instead of `TRANS` and `zhetrs` instead of `zgetrs`. The
  factorization is Bunch-Kaufman (`zhetrf`), not LU.
- Fortran indexing of the row-wise CABS1 sum for `UPLO='U'`:
  `j = 1..i` reads `A(j,i)` (column `i`, stored upper half), while
  `j = i+1..N` reads `A(i,j)` (row `i`, upper half). Lower triangle
  swaps the two. Translating this verbatim avoids any mirror-conjugate
  reads.
- Because `CABS1(z) = |re| + |im|` is invariant under conjugation, no
  `conj()` is needed when traversing the Hermitian mirror for the norm
  step — this is the Hermitian-vs-symmetric simplification that makes
  the routine look identical for both storage conventions at the
  CABS1 level.
- The diagonal of a Hermitian matrix is real, so the diagonal entries
  contribute `|re|` only in CABS1 (the Fortran reference still adds
  `|im|`, which is 0 for a valid input — we do the same).

## Dependency interface surprises

- `zhetrs` takes `nrhs` as its 3rd argument (`uplo, N, nrhs, AF, ...`),
  matching the Fortran order. Pass `nrhs = 1` here.
- `zlacn2` reverse communication: state via
  `(EST Float64Array(1), KASE Int32Array(1), ISAVE Int32Array(3))`.
  Initialize all to zero; loop until `KASE[0] === 0`. `KASE=1` means
  multiply by `A` (then solve), `KASE=2` means multiply by `A^H`
  (then solve).
- For the Fortran test fixture, we use `ZHETRF` with an LWORK big
  enough (set `LWORK=64` for `N<=3` safety). On the JS side we call
  `zhetrf` directly in the test rather than hard-coding the factored
  form — identical to the `zla_gercond_c` test pattern.

## Complex number handling

- All array element access is via a `Float64Array` view from
  `reinterpret(A, 0)`, with strides and offsets multiplied by 2. The
  routine never allocates `Complex128` scalars — the only complex
  operations are CABS1 sums (pure real math on re/im), elementwise
  real-scalar scaling, and the dependency calls.
- No complex division, sqrt, or abs is inlined; those would require
  numerical-stability algorithms and are only reached through
  `zhetrs`/`zlacn2`.

## Testing notes

- Test the 3x3 Hermitian indefinite matrix for both `UPLO='U'` and
  `UPLO='L'` with both uniform and non-uniform `C`, plus `capply=false`
  for both triangles. This exercises the `capply` and `uplo` branches
  in the row-norm loop and the reverse-communication body.
- Two additional tests force `anorm === 0` (one per `uplo`) to cover
  the quick-return branch.
- The `N=0` and `N=1` edge cases are covered directly.
