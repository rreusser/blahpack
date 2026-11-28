# dlarft: Translation Learnings

## Translation pitfalls

- [x] In the real version, V(i, 0:i-1) is used directly without conjugation. In the complex version, conj(V(i, 0:i-1)) is needed.
- [x] The prevlastv tracking for skipping trailing/leading zeros requires careful initialization: prevlastv=N for forward, prevlastv=0 for backward (note: Fortran uses prevlastv=1 for backward, but in 0-based that maps to 0).
- [x] dgemv is called with column-major V and vector v as separate arguments. The vector stride parameter must match the storage stride (strideV1 for column-major column vector).

## Dependency interface surprises

- [x] Uses dgemv (real) and dtrmv (real). Both take scalar alpha/beta, not array pairs.
- [x] dtrmv was already implemented for the complex routines.

## Automation opportunities

- [x] Real dlarft mirrors zlarft exactly minus conjugation. The template pattern: remove all `vi = -V[iv+1]` conjugates, simplify complex multiply to real multiply.

## Coverage gaps

- [x] Forward+Columnwise (5x3 and 3x2), Backward+Columnwise (5x2), and tau=0 are tested. Row-wise storage paths are implemented but not tested.

## Complex number handling

- [x] N/A. Real-valued only.
