# zunbdb2: Translation Learnings

## Translation pitfalls

- **`bin/signature.py` lowercased `P` and `Q`** in the generated signature
  (treated them as plain integers). The dorbdb2 module uses uppercase
  `P, Q`; conformed to that convention by hand-renaming. Same issue
  reported in `zunbdb5/LEARNINGS.md` for `incx1, incx2`.
- The base.js layer reads/writes a complex `1+0i` at diagonal slots via
  the reinterpreted Float64 view (`X11v[ 2*o ] = 1.0; X11v[ 2*o+1 ] = 0.0`)
  rather than allocating `new Complex128(1, 0)`. Matches the
  `zero()`/unit-write pattern in `zunbdb5` / `zunbdb6`.
- `C` is captured as `DBLE( X11(I,I) )` — the real part only. `ZLARFGP`
  guarantees the new alpha is real and non-negative, so reading the
  real component via `X11v[ 2*o ]` is exact (no precision loss vs.
  computing the modulus).
- `PHI(I) = ATAN2( DBLE( X11(I+1,I) ), DBLE( X21(I,I) ) )` similarly
  uses the real parts only — both are LARFGP betas, guaranteed real
  and nonnegative.

## Dependency interface surprises

- **`zlarf` takes `tau` as `Complex128Array` + `offsetTau`**, not a
  `Complex128` scalar. The Fortran source passes `DCONJG(TAUP1(I))`
  and `DCONJG(TAUP2(I))` (conjugated tau) into ZLARF. Translated by
  allocating a single-element `Complex128Array(1)` scratch slot,
  copying-and-conjugating the relevant TAU into it before each call,
  and passing it with `offsetTau = 0`. Allocating once at routine entry
  (not per-call) avoids per-iteration garbage.
- `zscal(N, za, zx, strideX, offsetX)` takes the scalar `za` as a
  `Complex128`. The constant `(-1, 0)` is hoisted to module scope
  (`NEG_ONE`).
- `zdrot(N, zx, strideX, offsetX, zy, strideY, offsetY, c, s)` takes
  `c, s` as plain real numbers — same convention as `drot`.

## Complex number handling

- Reinterpreted Float64 views (`X11v = reinterpret(X11, 0)`,
  `X21v = reinterpret(X21, 0)`) are computed once at function entry
  and reused for diagonal `1+0i` plants and `DBLE(...)` reads. Index
  into them with `2 * oX11ii` (complex offsets doubled).
- Conjugation of a tau scalar happens via direct `re/-im` extraction
  using `TAUP1.get(o)` — clean for a single-element scratch slot but
  would be too allocating in a hot loop. The two ZLARF calls per
  iteration are not a hot loop relative to the inner BLAS work, so
  this is fine.
- No `cmplx.div` / `cmplx.abs` use — all complex arithmetic in this
  routine is addition/multiplication or done via delegated kernels
  (zlarfgp, zlarf, zunbdb5).

## Test design

- The Fortran test mirrors `test_dorbdb2.f90` step-by-step but with
  `complex*16` arrays, `EQUIVALENCE` for printing tau/X via Float64
  re/im pairs, and a Gram-Schmidt-twice generator that builds
  orthonormal-columns complex inputs (sin/cos coefficients to keep
  conditioning bounded).
- `pack_matrix` packs the leading P-by-Q (or (M-P)-by-Q) submatrix into
  a contiguous buffer before printing — this avoids the NMAX-stride
  EQUIVALENCE-padding trap noted in SKILL.md. The packed buffer is
  itself `complex*16`, equivalenced to a `2*NMAX*NMAX` Float64 array
  for `print_array`.
- 100% line and branch coverage on `base.js`, `ndarray.js`, `main.js`,
  `index.js`. The wrapper `zunbdb2.js` has explicit tests for every
  `RangeError` and `TypeError` branch, including both row-major and
  column-major LDX validation.

## Process improvements

- The init_routine.py-generated `deps_zunbdb2.txt` was missing the
  BLAS-level deps (`zdrot, zgemv, zgerc, zscal, dznrm2`) plus the
  Fortran-only modules `la_constants, la_xisnan` (transitively
  required by zlassq). Same gap as `zunbdb5`. Cross-checking against
  `deps_dorbdb2.txt` revealed the missing routines quickly.
- The scaffolded examples/index.js called `zunbdb2('row-major', M, N, A, B, C)`
  (totally wrong arity/types) — had to be hand-rewritten to a real
  working example. The signature has 20 args and the scaffold has no
  way to guess them.
