# zlauum: Translation Learnings

## Translation pitfalls

- **CRITICAL: Blocked vs unblocked consistency requires real diagonals.** The unblocked zlauu2 uses `AII = DBLE(A(I,I))` (real part only), while the blocked algorithm calls ztrmm which applies the full complex diagonal. For Cholesky factors (the intended input), diagonal entries are real, so both paths agree. For test inputs with complex diagonals, blocked and unblocked paths give DIFFERENT results. Always use real-diagonal test data.
- Fortran uses `'Conjugate transpose'` which maps to `'C'` in the JS single-char convention. The real analog dlauum uses `'T'` (transpose). This is the key difference.
- `zherk` takes REAL scalars for alpha and beta (not Complex128), unlike zgemm which takes Complex128.

## Dependency interface surprises

- `ztrmm` takes `Complex128` alpha scalar -- used `CONE = new Complex128(1.0, 0.0)`.
- `zherk` takes `number` (real) for both alpha and beta -- `1.0`, not `CONE`.
- `zgemm` takes `Complex128` for both alpha and beta.
- All three (ztrmm, zgemm, zherk) use complex-element strides/offsets.

## Automation opportunities

- N/A; direct analog of dlauum with 'T' -> 'C' and dsyrk -> zherk.

## Coverage gaps

- 100% line and branch coverage achieved with NB=2. Both blocked upper and lower paths exercised with 3x3 and 4x4 test data.
- NB=2 was chosen (matching ztrtri) to ensure blocked paths are exercised with small test matrices.

## Complex number handling

- Only Complex128 constants used (`CONE`). No complex arithmetic inlined in this routine.
- The real analog uses `dsyrk` (symmetric rank-k); the complex analog uses `zherk` (Hermitian rank-k). zherk has real alpha/beta while zgemm has complex alpha/beta.
