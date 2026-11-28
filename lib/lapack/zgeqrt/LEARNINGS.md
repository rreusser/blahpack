# zgeqrt: Translation Learnings

## Translation pitfalls

- **`USE_RECURSIVE_QR=.TRUE.` in Fortran calls `zgeqrt3` (untranslated).**
  The reference defaults to the recursive panel kernel, but `zgeqrt3` is
  not yet ported. The JS implementation unconditionally takes the
  `zgeqrt2` (unblocked) panel branch — exactly the same pattern as the
  `dgeqrt` port. Mathematically `zgeqrt2` and `zgeqrt3` produce identical
  V/T factors, so the Fortran fixture (generated with `USE_RECURSIVE=TRUE`)
  matches the JS output bit-for-bit at 1e-12. When `zgeqrt3` lands,
  swapping the panel kernel is a one-line change in `base.js`.
- **`'transpose'` becomes `'conjugate-transpose'` in the `zlarfb` call.**
  This is the one substantive z-vs-d mechanical change in the body.
  Forgetting this conjugates nothing and produces subtly wrong updates
  on any matrix with non-zero imaginary parts (real-only test cases would
  not catch it — explicitly include a complex test like `m4_n3_nb2`).
- **`T` is `nb`-by-`min(M,N)`, not `nb`-by-`nb`.** The wrapper validators
  must use `LDT >= nb` (column-major) and `LDT >= max(1,K)` (row-major),
  not the scaffold's default `LDT >= max(1,M)`. The block triangular
  factor stores all per-panel `T1..TB` factors side-by-side in columns;
  the i-th panel writes its `ib`-by-`ib` factor at `T(:, i:i+ib-1)`.

## Dependency interface surprises

- **`zlarfb` takes 2D WORK strides** `(strideWORK1, strideWORK2)`,
  matching `dlarfb`. The Fortran call passes `LDWORK = N-I-IB+1` (the
  trailing column count). In the JS port, the single `strideWORK` API
  parameter is replicated as `strideWORK1=strideWORK,
  strideWORK2=ldwork*strideWORK` so the caller only ever sees one stride.
- **`zgeqrt2` returns `0` always** (no algorithmic failure mode), so the
  blocked driver drops the per-panel `IINFO` rather than offsetting it.
- **The Fortran fixture `m4_n3_nb2` has a +1.11e-16 imaginary residue on
  one R diagonal entry.** This is a benign rounding leftover from
  Fortran arithmetic. Our 1e-12 tolerance comfortably absorbs it; tighter
  tolerances (1e-15) would spuriously fail.

## Complex number handling

- **Body is "delegation only".** All arithmetic is done by `zgeqrt2` and
  `zlarfb`, so this routine never touches complex values directly — no
  `reinterpret`, no `cmplx.*` calls. The gate emits a warning that the
  z-prefix base.js doesn't use `reinterpret()`; this is correct and
  expected for pure dispatch routines (the same will be true for any
  blocked driver that only wires panel kernel + reflector application).
- **z-port test scaffolding doubles every index.** All `view[ k * 2 ]` /
  `view[ k * 2 + 1 ]` access patterns. Best to start from the d-prefix
  test as a template and mechanically multiply offsets by 2 — that is
  precisely what was done here.

## Coverage notes

- `zgeqrt/lib/base.js`: **100% line / 100% branch** with the same panel
  shape variations used for `dgeqrt` (small/large block, last block
  smaller than `nb`, single-reflector blocks `nb=1`, single-block full-K
  factor, wide `M<N`) plus the two quick-return cases and a
  `purely-real-input` case to exercise `zlarfg`'s `alphi==0` branch.

## Automation gaps

- The scaffolded `zgeqrt.js` still validates `LDT >= max(1,M)` because
  `scaffold.py` cannot infer that `T` is `nb`-by-K rather than M-by-N.
  Audit/rewrite by hand — same as for `dgeqrt`. (Identical bug, second
  occurrence: candidate for `scaffold.py` to special-case the
  `compact-WY` family.)
- The scaffolded `examples/index.js` and `benchmark/*.js` use
  `uniform( N*N, ... )` to create real-typed allocations and a wrong
  `strideWORK` parameter on the layout-style API. Replace with
  `Complex128Array` allocations and drop the extra `strideWORK` argument
  to match the wrapper signature `(order, M, N, nb, A, LDA, T, LDT, WORK)`.
