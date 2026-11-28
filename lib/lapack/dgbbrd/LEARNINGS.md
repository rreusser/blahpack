# dgbbrd: Translation Learnings

## Translation pitfalls

- The Fortran `WORK` array is partitioned in-place as two logical halves:
  `WORK(1..N)` stores sine values, `WORK(MN+1..MN+N)` stores cosine values,
  where `MN = max(M, N)`. In JS we preserve this by passing the same WORK
  array with different offsets to dlargv/dlartv/dlartg/drot. The JS caller
  must allocate `WORK` of length `2 * max(M, N)`.

- Three nested branching structures in the chasing loop (`ml > ml0`,
  `ml === ml0 && mu > mu0`, and the after-kk decrement) must preserve the
  exact Fortran counter update order: `nr`, `j1`, `j2` are updated in the
  same sequence so that the `dlargv`/`dlartv` calls see the same fill-in
  chain. A subtle off-by-one here breaks fill-chasing for banded matrices
  with `kl+ku > 2`.

- The `drot` call using stride `LDAB-1` corresponds to walking along a
  diagonal of the band (both increments compensate for the column/row stride
  shift). In the ndarray form this becomes `strideAB2 - strideAB1`.

- The final phase (`ku > 0` && `M < N`) reduces the last extra superdiagonal
  entry using a downward sweep; `rb` carries state between iterations and
  must be updated to `-rs * AB(ku, i)` **before** overwriting AB.

## Dependency interface surprises

- `dlartg` in this codebase writes `[c, s, r]` into a preallocated
  `Float64Array(3)` output buffer rather than returning them. We reuse a
  single module-scoped `LARTG_OUT` buffer to avoid per-call allocation.

- `dlargv`/`dlartv` use an `inca` stride equal to `(kb+1) * LDAB`, which in
  the 2D stride encoding becomes `(kb+1) * strideAB1`. This stride walks
  across successive rotation positions along the band diagonal rather than
  along a row or column.

## Validation notes

- `vect` is validated at the public-API level (both `dgbbrd` and the ndarray
  entry point) as one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`.
  The Fortran single-character flags ('N', 'Q', 'P', 'B') are never used in
  the JS surface.
