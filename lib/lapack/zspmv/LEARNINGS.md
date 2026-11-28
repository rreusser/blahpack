# zspmv: Translation Learnings

## Translation pitfalls

- The critical difference from zhpmv (Hermitian) is that zspmv uses `AP[k] * x[i]` (no conjugation) for off-diagonal accumulation into temp2, whereas zhpmv uses `conj(AP[k]) * x[i]`. This changes the sign of the imaginary part in the cross-product multiplication.
- The diagonal element is fully complex in zspmv (both real and imaginary parts needed), whereas in zhpmv the diagonal is real-only. This requires an extra variable (ajjI) and full complex multiply for the diagonal contribution.
- The negative-stride test requires offsetX pointing to the last element (index N-1), matching the Fortran convention where KX = 1 - (N-1)*INCX maps to a 0-based offset of N-1.

## Dependency interface surprises

- N/A (zspmv is a leaf routine with no BLAS/LAPACK dependencies)

## Automation opportunities

- The zhpmv-to-zspmv translation is mechanical: remove conjugation from off-diagonal reads, add imaginary part to diagonal handling. Could be automated for future symmetric-vs-Hermitian pairs.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.

## Complex number handling

- All complex multiplication was inlined (safe: addition, subtraction, multiplication).
- No complex division or absolute value needed.
- Used the standard reinterpret pattern: Complex128Array at API boundary, Float64Array internally with strides/offsets multiplied by 2.
- Complex scalar alpha and beta extracted via real()/imag() at function entry.
