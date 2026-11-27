# dlaqtr: Translation Learnings

## Translation pitfalls

- SCALE is a pure output scalar in Fortran, so it is dropped from the JS
  positional parameter list and returned on the result object as
  `{ info, scale }`. This mirrors `dlaln2`'s `{ info, scale, xnorm }`
  convention. The signature-conformance lint check still emits a warning
  because the canonical Fortran pattern lists `scale`; this is accepted
  the same way `dlaln2` accepts it (warning only, not an error).
- X is logically length `2*N` in the complex case (`lreal = false`): the
  first N entries hold the real part and entries `N+1..2*N` hold the
  imaginary part. dlaqtr reuses a single strided X buffer for both,
  and the JS port follows the same layout. `offsetX + (N * strideX)`
  indexes the imaginary tail.
- `B(1)` is used as the first diagonal of the complex matrix when
  `j1 == 1` (replacing `W`). Do not skip the `j1 == 1` special case in
  the non-transposed 1x1 branch or the transposed branch — it's load
  bearing for the corner column.
- The `MAX( WORK(j1), WORK(j2) ) > (BIGNUM-xj) / xmax` comparison in
  the complex transposed 2x2 block branch uses `/ xmax` rather than
  `* rec` (where `rec = 1/xmax`), matching the original Fortran exactly.
  This is not a typo and must be preserved verbatim to avoid overflow.

## Dependency interface surprises

- `dlaln2(ltrans, na, nw, smin, ca, A, sA1, sA2, oA, d1, d2, B, sB1, sB2, oB, wr, wi, X, sX1, sX2, oX)`
  returns `{ info, scale, xnorm }`. D (RHS) and V (output) are stored
  column-major; we use strides `(1, 2)` with a flat length-4 Float64Array
  so columns are interleaved as `[D11, D21, D12, D22]`.
- `idamax` returns a 0-based index (not 1-based as in Fortran), so
  `xmax = |x[k*stride]|` after the call rather than `|x[(k-1)*stride]|`.
- For the max-norm (`'max'`) of a strided 1-D vector, computing
  `max(|b[i]|)` directly is simpler than routing through `dlange`
  with a contrived leading dimension.
