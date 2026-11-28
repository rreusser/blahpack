# zlarfx: Translation Learnings

## Translation pitfalls

- The dlarfx counterpart uses individual unrolled loops per M/N case (1-10), but
  the complex version uses the same math with complex multiply-accumulate. Rather
  than replicating each of the 10 left + 10 right unrolled cases individually,
  the JS translation uses a single loop-based helper for each side (`applyLeft`,
  `applyRight`) that handles M/N = 1..10 uniformly. This avoids 400+ lines of
  copy-paste and is numerically equivalent since the Fortran unrolled code is
  just an optimization of the same loop.

- The M=1 and N=1 cases are special: they compute `T1 = ONE - tau*v(1)*conj(v(1))`,
  which uses `|v(1)|^2` (always real). The general cases for M=2..10 and N=2..10
  use different conjugation patterns for left vs right:
  - LEFT: `Vk = conj(V(k))`, `Tk = tau * V(k)` (unconjugated)
  - RIGHT: `Vk = V(k)` (unconjugated), `Tk = tau * conj(V(k))`

## Dependency interface surprises

- zlarf takes tau as `(Complex128Array, offsetTau)` not as a Complex128 scalar.
  When zlarfx falls back to zlarf for the general case (M>10 or N>10), it must
  wrap its Complex128 scalar tau into a 1-element Complex128Array.

## Automation opportunities

- None identified. The dlarfx -> zlarfx transformation was mechanical but the
  complex arithmetic differences made full automation impractical.

## Coverage gaps

- No coverage gaps. 100% line and 100% branch coverage on base.js.

## Complex number handling

- All complex arithmetic is inlined (addition, subtraction, multiplication,
  conjugation, real-scalar scaling). No division, absolute value, or square root
  is needed, so no cmplx.js calls were required.
- Conjugation is sign-flip of imaginary part.
- `tau * conj(V(k))` is computed as: `(tauR*vR + tauI*vI, -tauR*vI + tauI*vR)`.
- `tau * V(k)` is computed as: `(tauR*vR - tauI*vI, tauR*vI + tauI*vR)`.
