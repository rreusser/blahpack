# zlaqps: Translation Learnings

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zlaqps.f` (367 lines, 149 code body)
- **Complexity**: 2 GOTOs (while-loop + linked-list norm recomputation)
- **Dependencies**: zgemm, zgemv, zlarfg, zswap, idamax, dznrm2, dlamch
- **Coverage**: 94.30% line, 83.33% branch

## GOTO Restructuring

The 2 GOTOs restructured as follows:

1. **Label 10 (while-loop)**: `K=0; 10 CONTINUE; IF (K<NB .AND. LSTICC==0) THEN ... K=K+1; GO TO 10; END IF`. Became `while (k < nb && lsticc === 0) { ... k += 1; }`.

2. **Label 60 (linked-list traversal)**: `60 CONTINUE; IF (LSTICC>0) THEN ... LSTICC = ITEMP; GO TO 60; END IF`. Became `while (lsticc > 0) { ... lsticc = itemp; }`. This traverses a linked list stored in VN2 to recompute column norms that became inaccurate.

## Translation pitfalls

- The Fortran KB output parameter is returned as a scalar from the JS function instead of being passed by reference. Callers must capture the return value.
- The F matrix swap `CALL ZSWAP(K-1, F(PVT,1), LDF, F(K,1), LDF)` swaps rows of F. In our convention, row PVT of F starts at offset `pvt * sf1`, and columns are traversed with stride `sf2`. So `zswap(k, F, sf2, oF + 2*pvt*sf1, F, sf2, oF + 2*k*sf1)` correctly swaps rows.
- The conjugation of F(k, 0:k-1) before the zgemv call is done in-place (flip sign of imaginary parts), then un-conjugated afterward. This avoids allocating a temporary array.

## Dependency interface surprises

- zgemv is used with two different stride patterns: (1) matrix strides for the matrix argument, (2) matrix strides used as vector stride for accessing a row of F. The `F(k,0), LDF` pattern in Fortran (step through a row with stride LDF) maps to `F, sf2, oF + 2*k*sf1` in JS.
- zgemm is called with M=1 for a rank-1 row update. This works because zgemm treats 1-row operations efficiently.

## Automation opportunities

- N/A. The GOTO restructuring is specific to this routine's control flow.

## Coverage gaps

- Lines 172-178: The `zlarfg(1, ...)` branch when `rk >= M-1`. This occurs when the last row of the matrix is being processed, requiring a specific matrix size relative to the block size.
- Lines 267-269, 301-308: The trailing matrix update and norm recomputation linked-list traversal. The linked-list norm recomputation (lsticc > 0) is triggered when column norms become too inaccurate, which requires a matrix where the cheap norm-downdate formula fails the tolerance test.

## Complex number handling

- Used `cmplx.abs()` for computing `|A(rk, j)|` in the norm update formula.
- In-place conjugation of F row elements is done by flipping the sign of the imaginary part at specific Float64 indices, avoiding library calls.
- No complex division was needed; all complex arithmetic is handled by the BLAS calls (zgemv, zgemm) and zlarfg.
