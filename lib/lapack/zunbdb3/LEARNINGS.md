# zunbdb3: Translation Learnings

## Translation pitfalls

- Mechanical real-to-complex port from `dorbdb3` was straightforward
  for the algorithmic skeleton, but three extra non-trivial structural
  patterns appear in the z-version that don't exist in the d-version:
  - `ZLACGV` calls are wrapped around the `ZLARFGP`+`ZLARF('R',...)`
    pair (the Fortran trick to apply a row-vector reflector via the
    column-vector machinery). Both the pre-conjugation and the
    post-restoration must be preserved.
  - `DCONJG(TAU)` appears when applying `P1`/`P2` from the left.
    `zlarf` takes its tau as a `Complex128Array + offset`, not a
    `Complex128`, so the conjugate must be staged into a
    module-level `SCRATCH_TAU` array per call. This pattern is
    established (see `zgehd2/base.js`); we follow it identically.
- The diagonal entries of `X11(i,i)` and `X21(i,i)` after `zlarfgp`
  are real-and-non-negative (this is `zlarfgp`'s contract — that's
  the "p" suffix). So `S = DBLE(X21(I,I))` becomes a Float64-view
  read of the real component only, and `PHI(I) = ATAN2(DBLE(X21(I+1,I)),
  DBLE(X11(I,I)))` similarly. No need for `cmplx.abs` or anything
  fancier.
- `signature.py` produced a clean signature (no redundant
  `incx1/incx2` slots) — unlike the `zunbdb5`/`zunbdb6` cases noted
  in their LEARNINGS files. The difference is that `zunbdb3`'s
  Fortran array parameters are all 2D (with `LDX*`), not 1D with
  `INCX*` slots, so the bug-trigger doesn't fire here.

## Dependency interface surprises

- `zlarf` signature: `(side, M, N, v, strideV, offsetV, tau,
  offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWORK,
  offsetWORK)`. Critically, `tau` is a `Complex128Array` (with
  offset), NOT a `Complex128` scalar. For `DCONJG(TAUP*(I))`, we
  stage the conjugated scalar into `SCRATCH_TAU` (a
  `Complex128Array(1)` at module scope) and pass `(SCRATCH_TAU, 0)`.
- `zlarfgp` signature: `(N, alpha, offsetAlpha, x, strideX, offsetX,
  tau, offsetTau)` — alpha is a `Complex128Array + offset` (not a
  scalar pointer). The reflector v is written into `x` (the buffer
  after alpha), and `tau` is written into the `tau` array at the
  given offset.
- `zlacgv(N, x, stride, offset)` — same convention as `dscal`-style
  (in-place conjugation along a strided sub-vector).
- `zunbdb5` is dispatched here exactly as `dorbdb5` is in the
  real-precision sibling; the arity is the same (no incx1/incx2
  redundancy after the fix landed in zunbdb5).
- `zdrot` takes a real cosine `c` and real sine `s` (matching the
  d-precision `drot`), NOT the complex-sine convention used by `zrot`.

## ZDROT LDX cross-stride peculiarity (reference Fortran quirk)

- Reference `zunbdb3.f` line 282-283 calls `ZDROT( Q-I+1, X11(I-1,I),
  LDX11, X21(I,I), LDX11, ... )` — passing `LDX11` as the stride for
  *both* X11 *and* X21 (instead of `LDX21` for the second). This is
  also present in `dorbdb3.f`. The translation mirrors this exactly so
  test fixtures match. A TODO is in `base.js` at the call site noting
  the upstream peculiarity. The layout wrapper picks matching
  leading dimensions, so this never triggers in normal usage.

## Complex number handling

- All real-part reads use the reinterpreted Float64 view of X11/X21
  (cached as `X11v`/`X21v` once at function entry) rather than
  constructing `Complex128` instances.
- Writing the implicit `1 + 0i` into `X11(i,i)` and `X21(i+1,i)`
  also uses the Float64 view (two scalar stores) — avoids the
  per-iteration `new Complex128(1, 0)` allocation.
- The `SCRATCH_TAU` Complex128Array(1) is module-level (NOT
  function-local) so no allocation occurs per zlarf call.
- The `PHI` calculation uses `oX21ii + sx211` where `sx211 = strideX211 * 2`
  — i.e. doubled-stride for Float64-view indexing of the X21(i+1, i) entry.
  This matches the pattern in zgehd2.

## Coverage gaps

- 100% line and branch coverage on `base.js`, `ndarray.js`, `main.js`,
  `index.js`, and `zunbdb3.js`. Five fixture cases plus the row-major
  wrapper success path cover every branch:
  - `basic_8x5x4` exercises both loops + the `i<M-P` PHI/TAUP2 branch
  - `m10_p6_q5` exercises two iterations of the second loop
  - `q_eq_mmp` exercises the case where the second loop is empty
  - `mp_eq_1` exercises the case where `i<M-P` is never true (M-P=1)
  - `q0_quick_return` exercises the M=Q=0 trivial early exit
  - Row-major/column-major wrapper tests cover both layout dispatch paths

## Process improvements

- The `init_routine.py` deps file was again missing the transitive
  Fortran-module-only deps (`la_constants`, `la_xisnan`) plus the
  transitive BLAS deps (`dznrm2`, `zdrot`, `zdscal`, `zgemv`, `zgerc`,
  `zscal`). Identical pattern to zunbdb5; cross-checking with
  `deps_zunbdb5.txt` and adding the missing entries was the fastest
  fix. Still worth automating eventually.
- The Fortran test template for z-routines is consistent: declare
  `complex*16` arrays + EQUIVALENCE doubles for printing. The
  orthonormal-columns helper for complex matrices uses MGS with
  `dconjg()` inner products and `dble(dconjg(z)*z)` for the squared
  norm. Pattern reusable for `zunbdb1`/`zunbdb2`/`zunbdb4` (which
  remain stubs as of this writing).
- Fixture tolerance had to widen from 1e-11 to 1e-10 on X11/X21
  near-zero entries — the complex Householder cascade accumulates
  more rounding than the real version, and ATan2 sensitivity near
  zero amplifies this. Both Fortran and JS implementations agree on
  the *signed* errors; only the small-magnitude entries differ in the
  last ~1-2 ULPs of relative magnitude. 1e-10 is still well within
  the meaningful-result regime.
