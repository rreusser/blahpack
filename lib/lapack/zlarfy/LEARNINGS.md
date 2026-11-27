# zlarfy: Translation Learnings

## Translation pitfalls

- Structurally identical to `dlarfy` — single straight-line sequence of
  `zhemv`/`zdotc`/`zaxpy`/`zher2` calls. The interesting difference is that
  `tau` is a complex scalar, so the `-0.5 * tau * dotc` intermediate also
  must be computed as a `Complex128`, not a real multiplication.
- Quick return condition is `tauR === 0 && tauI === 0` (both parts must be
  zero). Using `||` would incorrectly short-circuit when tau is purely
  imaginary or purely real non-zero.
- Fortran initializes `C` as `complex*16 :: C(25)` (1D) — so `C(4)`, `C(5)`
  refer to complex elements 4 and 5, not `C(row,col)`. When building the
  corresponding JS Complex128Array initializer the layout must match
  column-major with leading dimension LDC, which in the N=2 tau_zero test
  means complex slot 3 is the (1,1) entry.

## Dependency interface surprises

- `zhemv` takes `Complex128` for both alpha and beta. Pre-allocated
  module-level `CONE = Complex128(1,0)` and `CZERO = Complex128(0,0)`
  constants keep the call sites tidy and avoid per-call allocation.
- `zdotc` returns a `Complex128` value (not an out-parameter). Extract
  real/imag via `@stdlib/complex/float64/real` and `/imag`.
- `zaxpy` takes `za` as a `Complex128` (not an array). Must construct a
  fresh `Complex128( alphaR, alphaI )` per call since `alpha` varies.
- `zher2` takes `alpha` as `Complex128` — negation requires constructing
  `new Complex128( -tauR, -tauI )` rather than any scalar negation helper.

## Complex number handling

- Inlined the `-0.5 * tau * dot` scalar multiplication (two real/imag
  products) since it is a single safe complex multiply + real scaling —
  no need for `cmplx.mul`.
- No division or absolute value involved, so no stability concerns.
