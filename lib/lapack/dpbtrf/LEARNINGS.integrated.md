# dpbtrf: Translation Learnings

## Translation pitfalls

- The blocked algorithm operates on band storage as if it were a dense matrix by using `sa2 - sa1` (= LDAB-1) as the leading dimension for dpotf2, dtrsm, dsyrk, and dgemm calls. This is the key insight: band rows within LDAB become the "rows" of a dense submatrix with stride LDAB-1 between columns.
- WORK array is LDWORK x NBMAX (= 33 x 32). Data is copied from band storage into WORK for the "wrapping" (i3 > 0) case, processed with BLAS-3, then copied back. The copy loops have different indexing for upper vs lower.
- i2 = min(KD-IB, N-I-IB) is the number of columns handled by direct in-place updates (dtrsm + dsyrk). i3 = min(IB, N-I-KD) is the number of columns that "wrap around" the band and require WORK buffering. When KD = NB, i2 = 0 and only the wrapping path is used. When KD > NB, both paths are active.
- The dpotf2 call for the diagonal block uses `sa2 - sa1` (= LDAB-1) as strideA2, not the full band column stride sa2. This is correct because adjacent columns of the diagonal block are LDAB apart in flat storage, but the "next row in same column" is 1 apart, so the effective leading dimension is LDAB-1 for row-by-row stepping.
- INFO offset: when dpotf2 returns nonzero info ii, the returned info is `i + ii` (0-based block start + 1-based position within block). This matches the Fortran `INFO = I + II - 1` because Fortran I is 1-based.

## Dependency interface surprises

- dpotf2(uplo, N, A, strideA1, strideA2, offsetA) -- strideA2 is used as the column stride. For band storage, pass `sa2 - sa1` (= LDAB-1), not the full `sa2`.
- dtrsm and dsyrk use the same stride remapping for band storage sub-views.

## Automation opportunities

- N/A -- the blocked algorithm with WORK buffering is too complex for mechanical automation.

## Coverage gaps

- Lines 83-85 (`if (nb < 1) nb = 1`) are unreachable dead code since NBMAX=32 is hardcoded. 99.31% line coverage, 97.22% branch coverage achieved.
- To exercise the i2>0 path requires KD > NB=32, exercised with KD=48 test.
- To exercise the i3>0 path requires N > i + KD, exercised with KD=32, N=64 test.
- The dgemm call (i2>0 && i3>0 simultaneously) requires KD > NB and N > block_start + KD, exercised with KD=48, N=128 test.

## Complex number handling

- N/A -- real routine only.
