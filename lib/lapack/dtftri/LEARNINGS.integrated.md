# dtftri: Translation Learnings

## Translation pitfalls

- The Fortran source calls DTRTRI (blocked triangular inverse), not DTRTI2 (unblocked). Using dtrti2 directly causes the singular test to fail because dtrti2 does not check for zero diagonals -- it just computes 1/0 = Infinity. Must use dtrtri which includes the singularity check.
- RFP layout uses 8 code paths (odd/even N x transpose/no-transpose x upper/lower). Each path has different LDA and offset calculations. Follow dpftrf as the structural template.
- The 1D RFP stride maps to 2D matrix strides as: strideA1 = sa (row stride), strideA2 = sa * LDA (column stride), where LDA depends on the code path (N, N+1, N1, N2, or K).

## Dependency interface surprises

- dtrtri(uplo, diag, N, A, sA1, sA2, oA) returns info (0=success, k>0=singular at position k). This matches the Fortran DTRTRI semantics.
- dtrmm has 15 parameters: (side, uplo, transa, diag, M, N, alpha, A, sA1, sA2, oA, B, sB1, sB2, oB). Both A and B share the same underlying Float64Array but with different offsets.

## Automation opportunities

- The 8 RFP code paths are highly mechanical. A code generator could produce all 8 branches from a parameterized template (LDA, offset formulas, uplo/trans swaps).

## Coverage gaps

- All 8 code paths covered by test fixtures (odd/even x normal/transpose x upper/lower).
- Both unit and non-unit diagonal variants tested.
- Singular matrix detection tested.
- N=0, N=1 edge cases tested.
- Larger N=5 (odd) tested for two paths.
- ndarray offset/stride tested.

## Complex number handling

- N/A: dtftri is a real-valued routine.
