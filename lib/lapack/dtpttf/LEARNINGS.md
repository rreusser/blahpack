# dtpttf: Translation Learnings

## Translation pitfalls

- The Fortran source uses 0-based AP and ARF arrays (`AP(0:*)`, `ARF(0:*)`), which is unusual for Fortran but simplifies the JS translation since no index shift is needed for the loop variables.
- The routine has 8 distinct code paths (odd/even N x normal/transpose x lower/upper). Each path has different index arithmetic for mapping between packed and RFP storage. The dtfttr reference implementation helped confirm the pattern.
- The `lda` variable is computed differently for normal vs transposed modes, which is easy to miss. In normal mode, `lda = N` (odd) or `lda = N+1` (even). In transposed mode, `lda = (N+1)/2` regardless of parity.

## Dependency interface surprises

- N/A: dtpttf has no dependencies (pure index-copying routine).

## Automation opportunities

- The scaffold generator did not add `isTransposeOperation` validation to ndarray.js for the `transr` parameter. This was a manual fix. The scaffold should detect `transr` parameters and add the import and validation automatically.

## Coverage gaps

- 100% line and branch coverage achieved. All 8 code paths are covered by the N=5 (odd) and N=6 (even) tests with all 4 transr/uplo combinations each.

## Complex number handling

- N/A: dtpttf is a real-valued routine.
