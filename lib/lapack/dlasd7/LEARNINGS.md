# dlasd7: Translation Learnings

## Translation pitfalls

- GOTO restructuring required careful attention. The original Fortran has a complex pattern: a first loop (DO 60) that scans for the first non-deflatable entry, then breaks out (GOTO 70) to a while-loop (labels 80/90) for the main deflation scan. The `j === N` early exit goes to label 100 (post-loop cleanup). Restructured as: first for-loop that breaks on either condition, then a `while(true)` with `j > N` break condition.
- The routine uses 1-based indexing throughout its internal integer arrays (IDX, IDXP, IDXQ, PERM, GIVCOL). Since these are part of the divide-and-conquer SVD bookkeeping and dlamrg produces 1-based values, it was cleaner to keep 1-based indexing internally and convert at array accesses with `(I-1)*stride`.
- The expression `IDXQ( IDX(JPREV)+1 )` is particularly tricky: IDX contains 1-based values from dlamrg, adding 1 gives a 1-based index into IDXQ. In 0-based JS, this becomes `IDXQ[offset + IDX[offset + (jprev-1)*stride] * stride]` since the 1-based-to-0-based conversion of `(v+1)-1 = v`.
- K, GIVPTR, C, S are output scalars in the Fortran but cannot be modified in-place in JS. These are returned as an object `{ info, K, givptr, c, s }` following the multi-output return convention.

## Dependency interface surprises

- dlamrg outputs 1-based index values (matching Fortran convention), which is documented in its base.js but easy to forget. The calling convention uses `(A, strideA, offsetA, dtrd1, dtrd2, INDEX, strideINDEX, offsetINDEX)`.
- drot uses ndarray signature `(N, x, strideX, offsetX, y, strideY, offsetY, c, s)` - the c,s are scalar parameters at the end, not array parameters.

## Automation opportunities

- The Fortran test leading dimension bug (LDGCOL=N vs LDGCOL=NMAX when declaring `GIVCOL(NMAX,2)`) cost significant debugging time. The `init_routine.py` or `gen_test.py` could validate or warn when 2D arrays are passed with a leading dimension smaller than the declared array size.

## Coverage gaps

- `idxj -= 1` branch (line ~290): requires a deflation pair where the second element's original index is in the upper half (idxj <= nlp1). The deflation test covers idxjp but not idxj in this condition.
- `DSIGMA(2) <= hlftol` branch (line ~322): requires DSIGMA(2) to be extremely small after merge, which only happens with pathological inputs where the smallest merged singular value is near zero.
- `Z(1) <= tol` when M > N (line ~328): requires both z1 and Z(M) to be tiny simultaneously when sqre=1.

## Complex number handling

- N/A: dlasd7 is a real-valued routine.
