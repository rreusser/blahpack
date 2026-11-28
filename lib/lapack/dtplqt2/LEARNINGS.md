# dtplqt2: Translation Learnings

## Translation pitfalls

- `dtplqt2` builds the compact-WY factor `T` incrementally by **reusing `T(0, i)`
  (i.e. `T(1, I)` in 1-based Fortran) as temporary scratch for `tau(i)` during
  the reflector-generation sweep**. Only in the second sweep does it move
  `tau(i)` to its final home at `T(i, i)` and zero the temporary slot. Treating
  the first sweep as writing the final `T` would be wrong — the 0-row cells are
  zeroed out at the end.
- Row `M-1` of `T` is also reused as a workspace vector `W` during the reflector
  apply step (before that row's own reflector is generated). This is safe because
  `dtplqt2` processes row `M-1` last — once `i = M-1`, the code skips the apply
  step entirely (`if I < M`).
- `P = N - l + min(l, I)` mixes 1-based and 0-based arithmetic; with a 0-based
  loop variable `i`, the correct translation is `N - l + min(l, i+1)`. The
  reflector length is `P+1` (one element from `A(i,i)` plus `P` from `B(i,0:P-1)`).
- Index mapping for `MP = min(P+1, M)` (Fortran 1-based): the 0-based row start
  for the rectangular `B2` gemv is `mp = min(p, M-1)`, NOT `min(p+1, M-1)`.
  Similarly `NP = min(N-l+1, N)` becomes `np = min(N-l, N-1)`.
- Final sweep's `dtrmv( 'L', 'T', 'N', ... )` uses `T` itself (the lower
  triangular portion at this point contains previously computed `T` rows) as
  the triangular matrix, multiplying row `i` in place.

## Dependency interface surprises

- `dlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )` takes
  `alpha` as `(array, offset)` and `tau` as `(array, offset)` — not scalars.
  Here we pass `A` for `alpha` (location `A(i,i)`) and `T` for `tau` (location
  `T(0,i)`), reusing those arrays directly rather than allocating scratch.
- `dger` signature is `(M, N, alpha, x, sx, ox, y, sy, oy, A, sA1, sA2, oA)`
  — the rank-1 update target comes last.

## Notes

- Fixture print_matrix packs row-by-column into `M*N` doubles, no padding, so
  test setup uses a small helper (`loadMat`) to scatter into leading-dim `LD`
  buffers and `packMat` to pack back for comparison.
- Rectangular `B2` gemv only triggers when `i > p`, so shapes like `M>N, l=N`
  exercise the `(i-p)` row count > 0 path; `m4_n2_l2` covers that.
