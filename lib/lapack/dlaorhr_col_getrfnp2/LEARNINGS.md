# dlaorhr_col_getrfnp2: Translation Learnings

## Translation pitfalls

- DSIGN(1, x) returns +1 when x == 0 (Fortran semantics), so the sign
  computation must use `(a >= 0) ? -1 : 1` rather than `Math.sign(a)` (which
  returns 0 for zero input).
- `D` array length is `min(M,N)` only — the routine writes only the leading
  `min(M,N)` entries. Tests that allocate `D` with `length = N` may see
  trailing zeros for wide (M < N) cases; the fixture for 3x4 reflects this.
- The recursive call passes a sub-matrix offset (`offsetA + n1*sa1 + n1*sa2`)
  and sub-D offset (`offsetD + n1*strideD`) without re-slicing — keep the
  full ndarray strides intact so dgemm/dtrsm see the parent leading dim.
- Integer division: use `(minMN / 2) | 0`, matching Fortran `MIN(M,N)/2`.

## Dependency interface surprises

- dtrsm right/upper/non-unit is used to solve B21 = B21 * U11^-1, where
  U11's diagonal entries are the post-elimination values (already negated
  by `D`). They are guaranteed >= 1 in magnitude by the modified-pivot
  construction.
