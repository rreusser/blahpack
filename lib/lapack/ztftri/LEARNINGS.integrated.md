# ztftri: Translation Learnings

## Translation pitfalls

- The Fortran source calls ZTRTRI (blocked triangular inverse), not ZTRTI2
  (unblocked). The JS ztrtri already exists and handles the blocking internally,
  so ztftri simply delegates to ztrtri + ztrmm.
- RFP offset mapping requires careful attention: Fortran uses 0-based indexing
  for the RFP array (A(0:*)), so the offset formulas translate directly with
  `sa * <fortran_offset>` where sa = strideA.
- Eight cases in the main logic: (N odd/even) x (TRANSR N/C) x (UPLO L/U).
  Each case has different LDA and offset patterns for the sub-matrices.
- For N even, the LDA values change: TRANSR='N' uses LDA=N+1, TRANSR='C'
  uses LDA=K=N/2.
- For N odd, TRANSR='N' uses LDA=N, TRANSR='C' uses LDA=N1.

## Dependency interface surprises

- ztrmm takes two matrix arguments (A and B) with separate stride/offset for
  each: `(side, uplo, transa, diag, M, N, alpha, A, sa1, sa2, oA, B, sb1, sb2, oB)`.
- ztrtri takes a single matrix: `(uplo, diag, N, A, sa1, sa2, oA)`.
- Both use complex-element-based offsets (not Float64 offsets), matching the
  RFP offset formulas.

## Automation opportunities

- The 8-case structure is identical between dtftri and ztftri (and zpftrf).
  A template-based generator could produce all RFP routines from one source.

## Coverage gaps

- All 8 TRANSR/UPLO/DIAG combinations are tested for N=3 (odd) and N=4 (even).
- Unit diagonal tested for all 8 combos.
- N=5 tested for 4 combos (larger odd).
- N=0, N=1, and singular matrix edge cases covered.

## Complex number handling

- No complex arithmetic is needed directly in ztftri -- all complex ops happen
  inside ztrtri and ztrmm.
- CONE = Complex128(1,0) and CNEGONE = Complex128(-1,0) are the only complex
  scalars, passed to ztrmm as alpha.
- The input array is Complex128Array, accessed via reinterpret in the sub-routines.
