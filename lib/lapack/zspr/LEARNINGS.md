# zspr: Translation Learnings

## Translation pitfalls

- Negative stride handling differs between Fortran and stdlib-js convention. Fortran computes `KX = 1 - (N-1)*INCX` internally, but in JS the caller provides `offsetX` which already encodes the start position. Using `jx = ox` (always) is correct; re-computing the Fortran KX from the offset caused out-of-bounds access.
- The Fortran `AP(KK+J-1) = AP(KK+J-1)` in the else branch (when `X(J).EQ.ZERO`) is a true no-op for zspr (symmetric), unlike zhpr (Hermitian) where it forces diagonal imaginary to zero. This means the JS code can simply skip the branch entirely.

## Dependency interface surprises

- N/A -- zspr is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The zhpr-to-zspr translation is highly mechanical: remove conjugation, change alpha from real to Complex128, remove diagonal imaginary zeroing. A transform could automate this for future symmetric/Hermitian pairs.

## Coverage gaps

- 100% line/branch/function coverage achieved. No gaps.

## Complex number handling

- Alpha is Complex128 (unlike zhpr where it is a real scalar). Extracted via `real(alpha)` and `imag(alpha)` at function entry.
- `temp = alpha * x[j]` is a complex-complex multiply (no conjugation), inlined as `(aR*xR - aI*xI, aR*xI + aI*xR)`.
- All complex multiplications in the inner loop are safe to inline (addition, subtraction, multiplication only -- no division or abs).
