# zungrq: Translation Learnings

## Translation pitfalls

- **`IF (II > 1)` → `if (ii > 0)`.** Fortran 1-based `II > 1` (i.e. `II >= 2`)
  translates to JS 0-based `ii >= 1` (equivalently `ii > 0`). When `ii === 0`
  (first reflector touches the first row), we must skip ZLARFT/ZLARFB and only
  call ZUNGR2, exactly as Fortran does.
- **Index translation for `N-K+I+IB-1`.** With `I` Fortran 1-based and JS
  `i = I - 1`, the count `N-K+I+IB-1 = N-K+(i+1)+ib-1 = N-K+i+ib`. Same for
  `II-1 → ii` (rows count above current block).
- **Mirror of `dorgrq` for complex.** The blocked driver maps mechanically:
  swap dependencies (`dorgr2 → zungr2`, `dlarft → zlarft`, `dlarfb → zlarfb`),
  use `'conjugate-transpose'` instead of `'transpose'` in the ZLARFB call,
  reinterpret A only for the explicit zero-init loops (everything else is
  delegated to dependencies that handle their own complex indexing).
- **Partial-block zero-init never runs when M == K.** The zero-init loop
  `for i=0; i<M-kk` only fires when M > K (so that `M - kk > 0` after the
  block-rounded `kk` is computed). Most paired fixture cases have M == K
  (K = min(M,N) from a full RQ), so a dedicated test that constructs an
  M > K case is needed to cover this branch.

## Test-strategy pitfalls

- **RQ decomposition is not unique.** ZGERQF can return TAU with sign
  flips compared to a Fortran reference; downstream ZUNGRQ output then
  differs element-wise from the Fortran fixture even though both are
  valid Q matrices. For tests that synthesize the ZUNGRQ input by running
  JS `zgerqf` (rather than reading a fixture A+TAU pair), use the
  property-based check `Q*Q^H = I` instead of comparing array elements.
  Element-comparison works only when the test reads the post-ZGERQF
  A and TAU directly from the Fortran fixture (the paired
  `_input` / output cases).
- **Constructing a K < M test.** To exercise ZUNGRQ with K < M (where the
  partial-block zero-init loop runs), do NOT feed it the output of a full
  ZGERQF on the M-by-N matrix and pass K<M — that pairs TAU(1..K) with the
  wrong reflector rows. Instead, RQ-factor a K-by-N sub-matrix, place the
  K reflector rows in the bottom K rows of the M-by-N A (leaving the top
  M-K rows arbitrary; ZUNGRQ zeros them as part of the algorithm).

## Dependency interface surprises

- `zlarft`/`zlarfb` use logically-2D WORK arrays with strides
  `(1, ldwork=M)`. After `zlarft` writes the IB-by-IB T factor into the
  first IB columns of WORK, the call to `zlarfb` passes
  `offsetWORK + ib` (in complex elements) as the start of the scratch C
  region — Fortran's `WORK(IB+1)` offset.
- `zungr2` reuses WORK as scratch (length `>= M`). Calling it AFTER
  `zlarft`/`zlarfb` in the blocked loop is safe because T is no longer
  needed at that point in the iteration.

## Complex number handling

- The only place we manipulate complex values directly in `base.js` is
  the two zero-init loops; everything else flows through the dependency
  modules which handle their own `reinterpret()` views.
- Conventional `sa1 = strideA1 * 2`, `sa2 = strideA2 * 2`, `oA = offsetA * 2`
  on the Float64 view, with `Av[ia]/Av[ia+1]` for re/im writes.
