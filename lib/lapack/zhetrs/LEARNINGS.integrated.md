# zhetrs: Translation Learnings

## Translation pitfalls

- Key difference from zsytrs: Hermitian diagonal is real, so 1x1 pivot solve uses `zdscal(nrhs, 1.0/real(A(k,k)), ...)` instead of complex `zscal`. This avoids complex division entirely for 1x1 pivots.
- In 2x2 pivot blocks, `DCONJG(AKM1K)` appears where zsytrs uses plain `AKM1K`. The conjugation pattern is asymmetric: upper uses `A(k-1,k-1)/AKM1K` and `A(k,k)/conj(AKM1K)`, lower uses `A(k,k)/conj(AKM1K)` and `A(k+1,k+1)/AKM1K`.
- The back-substitution phase uses `zlacgv` + `zgemv('conjugate-transpose')` + `zlacgv` instead of plain `zgemv('transpose')`. The zlacgv conjugation brackets are needed because the Hermitian solve requires conjugate-transpose operations on the solution vectors.

## Dependency interface surprises

- zlacgv takes strides in complex elements (not doubles), consistent with the Complex128Array convention at the API boundary.
- zdscal (real scalar times complex vector) takes a real scalar, not a Complex128 object, unlike zscal which takes a Complex128.

## Automation opportunities

- The pattern of converting zsytrs to zhetrs is largely mechanical: replace zscal with zdscal for real diagonal, add zlacgv brackets around zgemv calls, change 'transpose' to 'conjugate-transpose', and add DCONJG in the 2x2 pivot formulas. Could be captured as a transform.

## Coverage gaps

- Uncovered branches are the `kp !== k` swap conditions where all pivots in the test happen to be trivial. The 6x6 tests with forced 2x2 pivots cover the 2x2 code path. 95.86% line / 79.41% branch achieved.

## Complex number handling

- Inlined complex multiply `(a*b - c*d)` in the 2x2 pivot solve.
- Used cDiv for all complex divisions (numerical stability).
- Hermitian diagonal elements passed with imaginary part forced to 0.0 in cDiv calls.
