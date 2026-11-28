# zlauu2: Translation Learnings

## Translation pitfalls

- The diagonal value `AII = DBLE(A(I,I))` takes only the REAL part. This means zlauu2 assumes the diagonal is real (as in Cholesky factors). Test inputs MUST have real diagonal entries for consistency between blocked (zlauum) and unblocked (zlauu2) paths. Complex diagonals cause different results between the two algorithms.
- `ZDOTC` returns a `Complex128` object, but we only need `real(dot)` for the diagonal update. Must extract via `real()`.
- The `ZLACGV` conjugation before/after `ZGEMV` is critical -- without it, the Hermitian product is computed incorrectly.

## Dependency interface surprises

- `zdotc` returns `Complex128`, must extract real part with `real()` -- not a scalar.
- `zgemv` takes `Complex128` for alpha and beta, not plain numbers. Used `new Complex128(aii, 0.0)` for the real-scalar beta.
- `zdscal` takes a plain `number` for the real scale factor, not Complex128.
- `zlacgv` modifies the array in-place (conjugation), no return value needed.

## Automation opportunities

- N/A for this translation; direct analog of dlauu2 with complex types.

## Coverage gaps

- 100% line and branch coverage achieved. All paths exercised including both upper and lower, N=0 quick return, N=1 edge case, and the `else` branch (last column/row) of both uplo paths.

## Complex number handling

- `zdotc` call replaces `ddot` -- returns Complex128, real part extracted.
- `zlacgv` conjugation calls surround `zgemv` -- this is the key difference from the real version.
- `new Complex128(aii, 0.0)` used for complex scalar beta in zgemv call (aii is a real number).
- No complex division or absolute value needed.
