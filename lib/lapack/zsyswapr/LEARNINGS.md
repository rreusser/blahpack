# zsyswapr: Translation Learnings

## Translation pitfalls

- Mechanical complex analog of dsyswapr: identical structure, just swap
  dswap -> zswap. No conjugation anywhere because the matrix is complex
  *symmetric*, not Hermitian. The mirror element A(k,i) is literally equal
  to A(i,k) with no sign flip or conj on the imaginary part.

## Dependency interface surprises

- `zswap` takes `Complex128Array` directly with strides/offsets expressed in
  complex elements (not doubles). Internally it does `reinterpret()` and
  multiplies strides by 2. So this routine passes `strideA1`, `strideA2`,
  and the offset `offsetA + i1 * strideA2` through without any `*2`.
- Only the scalar diagonal swap needs a Float64 view via `reinterpret`; for
  that step we multiply indices by 2 manually to access the interleaved
  real/imag pair.

## Complex number handling

- No complex arithmetic required — only element copies (a temporary pair of
  real/imag doubles) for the diagonal swap. No cmplx.js usage at all.

## Testing

- Fortran test uses `equivalence (A, A_r)` to print interleaved re/im pairs.
  The base matrix is `A(i,j) = (10*min(i,j)+max(i,j), min(i,j)-0.1*max(i,j))`
  which is complex symmetric with distinct values so we can verify every
  individual swap.
