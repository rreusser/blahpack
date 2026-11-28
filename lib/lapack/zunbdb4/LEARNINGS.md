# zunbdb4: Translation Learnings

## Translation pitfalls

- The dorbdb4 → zunbdb4 port is largely mechanical, but the same
  three "extra" structural patterns from zunbdb1/2/3 also appear
  in zunbdb4 and are silent if missed:
  1. `ZLACGV` is wrapped around the row-vector reflector machinery
     in **all three loops** (not just the second and third). The
     phantom outer loop applies `zlacgv` before `zlarfgp` and again
     after the two right-applied `zlarf` calls. The d-precision
     sibling has no such pair (the row reflector path is the same
     as the column one for real-valued matrices), so this is the
     biggest structural difference.
  2. `DCONJG(TAUP1(I))` / `DCONJG(TAUP2(I))` for the left-applied
     `ZLARF` calls — staged into a module-level `scratchTau`
     (Complex128Array(1)) per call. Identical pattern to
     zunbdb1/2/3 and zgehd2.
  3. The `ZSCAL(P, NEGONE, ...)` in the i=0 branch of the phantom
     loop uses a complex `NEGONE = (-1, 0)`, but because the
     imaginary part is zero this is equivalent to `zdscal(P, -1.0,
     ...)`. Avoid allocating a Complex128 just to pass `(-1, 0)` —
     use the real-scalar `zdscal`.
- After `ZLARFGP`, the diagonal entries of `X11`/`X21`/`PHANTOM`
  are real and non-negative (`zlarfgp` contract — the "p" suffix).
  So `ATAN2( DBLE(X11(I,I-1)), DBLE(X21(I,I-1)) )` becomes a
  Float64-view read of the real component only — no `cmplx.abs`
  needed.
- `signature.py` lowercased `P` and `Q` (as warned in the agent
  prompt). The dorbdb4 sibling uses uppercase, so we did the same.
  No spurious `incx1`/`incx2` slots this time (only zunbdb5/6 have
  that signature.py bug, because they have 1D arrays with separate
  INCX parameters).

## Dependency interface surprises

- `zlarf( side, M, N, v, strideV, offsetV, tau, offsetTau, C, ... )` —
  `tau` is a `Complex128Array` (with offset), NOT a `Complex128`
  scalar. For `DCONJG(TAUP*(I))` we stage the conjugated scalar
  into a single-element scratch buffer.
- `zlarfgp( N, alpha, offsetAlpha, x, strideX, offsetX, tau,
  offsetTau )` — `alpha` is a `Complex128Array + offset` (not a
  scalar). The reflector `v` is written into `x` (the buffer after
  `alpha`), and the new `tau` is written into the `tau` array.
- `zlacgv( N, x, stride, offset )` — complex stride/offset.
- `zdrot( N, zx, sx, ox, zy, sy, oy, c, s )` — takes real `c, s`
  (the rotation here is real-valued; only the affected vectors are
  complex). Do NOT confuse with `zrot` (complex sine).
- `zdscal( N, da, zx, sx, ox )` — real scalar times complex
  vector. Use this in place of `zscal` when the multiplier is
  purely real, e.g. `(-1, 0)`. Saves a Complex128 allocation.
- `zunbdb5( M1, M2, N, ... )` — projection kernel. Its `info`
  return is intentionally discarded (Fortran's `CHILDINFO`).

## Complex number handling

- `X11v`/`X21v`/`PHANTOMv` are reinterpreted Float64 views cached
  once at function entry. All real-part reads use these directly
  rather than constructing `Complex128` instances.
- Planting the implicit `1 + 0i` for each Householder vector uses
  two Float64 writes via the view (no per-iteration `new
  Complex128(1, 0)`).
- The `scratchTau` Complex128Array(1) for `DCONJG(TAU)` is
  module-level (one allocation across all calls).
- The `ZSCAL(P, NEGONE)` → `zdscal(P, -1.0)` replacement keeps
  this call branch allocation-free (and one BLAS-1 op).

## Coverage gaps

- 100% line, branch, function coverage on `base.js`, `ndarray.js`,
  `main.js`, `index.js`, and `zunbdb4.js` (the layout wrapper). Five
  fixture cases plus six layout-wrapper validation tests cover every
  branch:
  - `basic_8x4x6` — all three loops + i=0 phantom branch + i>0
    re-orthogonalization branch
  - `m10_p5_q7` — larger general case, multiple iterations of
    each loop
  - `p_eq_q_no_third` — third cleanup loop (P+1..Q) is empty
  - `p_small_q_large` — second cleanup loop narrower than third
  - `m_eq_q_no_phantom` — M=Q so the phantom outer loop never
    runs; only the second/third cleanup loops execute
- Fixture tolerance widened to 1e-10 for X11/X21/PHANTOM entries
  (1e-12 for THETA/PHI/TAU). The complex Householder cascade
  accumulates more rounding than the real version, and
  ATan2 sensitivity near zero amplifies it. Same observation as
  zunbdb1/2/3 — 1e-10 is well within the meaningful-result regime.

## Process improvements

- The `init_routine.py` deps file was again missing the transitive
  Fortran-module-only deps (`la_constants`, `la_xisnan`) plus the
  transitive BLAS deps (`dznrm2`, `zdrot`, `zdscal`, `zgemv`,
  `zgerc`, `zscal`). Identical pattern to all zunbdb* siblings;
  cross-checking with `deps_zunbdb3.txt` and adding the missing
  entries was the fastest fix. Worth automating — the union of
  transitive-Fortran-only deps for the zunbdb family is now well
  understood.
- The Fortran test for zunbdb4 mirrors the dorbdb4 template
  exactly, with complex*16 arrays + EQUIVALENCE for printing and a
  complex orthonormal-columns initializer (MGS with `dconjg()`
  inner products). The dorbdb4 test cases (basic_8x4x6, m10_p5_q7,
  p_eq_q_no_third, p_small_q_large, m_eq_q_no_phantom) all port
  cleanly to the complex case — the dimension constraints and code
  paths are identical between real and complex.
