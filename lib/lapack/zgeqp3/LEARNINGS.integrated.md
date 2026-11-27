# zgeqp3: Translation Learnings

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zgeqp3.f` (369 lines, 173 code body)
- **Complexity**: 1 GOTO (while-loop for blocked panel factorization)
- **Dependencies**: zgeqrf, zlaqp2, zlaqps, zswap, zunmqr, dznrm2
- **Coverage**: 84.44% line, 75.00% branch

## GOTO Restructuring

The single GOTO (label 30) forms a while-loop for the blocked panel factorization:
```fortran
30 CONTINUE
   IF (J .LE. TOPBMN) THEN
      ... CALL ZLAQPS(..., FJB, ...)
      J = J + FJB
      GO TO 30
   END IF
```
Became `while (j < topbmn) { ... j += fjb; }`.

## Translation pitfalls

- **JPVT convention**: Fortran uses 1-based column indices in JPVT. Our translation preserves this convention: on exit, `JPVT[j] = k` means column j of A*P was originally column k (1-based) of A. On entry, `JPVT[j] != 0` means "fix column j to the front."
- **ILAENV/LWORK workspace query removed**: The Fortran source uses `ILAENV` to determine optimal block size and `LWORK` for workspace queries. We hardcode NB=32 and allocate workspace internally. The `lwork` parameter is kept in the signature for API compatibility but ignored.
- **RWORK layout**: RWORK serves as VN1 (first N entries) and VN2 (entries N+1..2N). When passing to zlaqp2/zlaqps, VN1 starts at `RWORK[j]` and VN2 at `RWORK[N+j]` for the j-th column of the subproblem.
- **zlaqps return value**: Our zlaqps returns KB (number of columns factored) as a scalar instead of via an output parameter. The Fortran FJB output parameter maps directly to `fjb = zlaqps(...)`.

## Dependency interface surprises

- zlaqps takes the full A matrix and column offset separately, not a submatrix. The `A` pointer and `JPVT/TAU/VN1/VN2` offsets must be adjusted for each blocked panel iteration.
- zunmqr is called with `'Left', 'Conjugate Transpose'` to apply Q^H to the free columns after factoring fixed columns. The full string 'Conjugate Transpose' is not valid -- only 'C' or 'c' is accepted. The Fortran source uses `'Conjugate Transpose'` because LSAME only checks the first character.

## Automation opportunities

- N/A. zgeqp3 is a driver routine with complex control flow (fixed columns, blocked panels, unblocked remainder). It does not have repeating mechanical patterns.

## Coverage gaps

- Lines 176-200: The blocked panel path using zlaqps is not exercised because all test matrices have fewer than NB=32 free columns (sminmn < NB), so the code falls through to the unblocked zlaqp2 path. Testing the blocked path would require matrices with > 32 free columns.
- Lines 113-116: The `nfxd < na` branch inside the fixed-column phase. This would require a matrix where some but not all columns are fixed, and M > nfxd.

## Complex number handling

- No direct complex arithmetic in zgeqp3. All computation is delegated to subroutines (zgeqrf, zlaqp2, zlaqps, zunmqr, zswap, dznrm2).
- dznrm2 operates on interleaved complex arrays but returns a real scalar (the Euclidean norm).

## Rank-deficient matrix behavior

- For rank-deficient matrices, the column pivoting may produce different tie-breaking than reference Fortran due to floating-point differences in norm computation. The test validates the mathematical properties (first pivot, R diagonal magnitudes) rather than exact bit-for-bit match.
