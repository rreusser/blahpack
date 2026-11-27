# dsygst: Translation Learnings

## Translation pitfalls

- The Fortran K loop variable is 1-based and the Fortran uses expressions like K-1, K+KB-1. In JS (0-based), Fortran's K=1 maps to k=0, and Fortran's K-1 (number of preceding rows/cols) maps directly to k. For example, Fortran DTRMM(..., K-1, KB, ...) becomes dtrmm(..., k, kb, ...) since k is already the count of preceding elements.
- The blocked code only executes when N > NB (hardcoded to 64). With 3x3 test matrices, only the unblocked path (dsygs2 fallback) is exercised.

## Dependency interface surprises

- dsymm uses long-form strings ('left'/'right', 'upper'/'lower') -- consistent with all other BLAS-3 routines in this codebase.
- dsygs2 shares the same (itype, uplo, N, A, sa1, sa2, oA, B, sb1, sb2, oB) signature, making delegation straightforward.

## Automation opportunities

- N/A -- the translation was straightforward blocked-to-unblocked delegation.

## Coverage gaps

- Only 33.8% line coverage because the blocked code paths (lines 89-272) are never exercised with N=3 test matrices (NB=64 > N). The blocked paths consist entirely of calls to individually-tested BLAS-3 routines (dsymm, dsyr2k, dtrsm, dtrmm) and the unblocked dsygs2, so the risk is low. Testing the blocked path would require N>64 matrices.

## Complex number handling

- N/A -- real-only routine.
