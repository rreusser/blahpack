# dtrevc3: Translation Learnings

## Translation pitfalls

- The Fortran WORK layout uses 1-based column indexing: `WORK(i + IV*N)` where IV starts at 1 or 2. In JS, this maps to `WORK[offsetWORK + (IV-1)*N + i]` but is simplified by using direct offsets: column 0 = norms, column 1 = WORK[N..2N-1], column 2 = WORK[2N..3N-1].
- Only the NB=1 (non-blocked) back-transform path was implemented. The blocked version (NB>1 with GEMM) is a performance optimization that requires more workspace and ISCOMPLEX tracking.
- The SOMEV (selective eigenvector) path requires careful pairing logic: for complex eigenvalue pairs, SELECT(J) and SELECT(J+1) must both be checked, and SELECT is modified to standardize which of the pair is selected. JS implementation handles this with boolean SELECT array.
- Right eigenvector loop iterates backward (ki = N-1 down to 0) while left eigenvector loop iterates forward (ki = 0 to N-1). The column counter `is` counts from M-1 downward for right and from 0 upward for left.
- Complex eigenvector pairs use two WORK columns for real and imaginary parts. For right eigenvectors: columns IV-1 (real) and IV (imag). For left: columns IV (real) and IV+1 (imag).

## Dependency interface surprises

- dlaln2 returns `{ info, scale, xnorm }` object instead of modifying scalar output parameters. The caller must destructure these.
- dlaln2 writes the solution X into a provided array. The X array layout is X[row + col*strideX2] with strideX1=1, strideX2=2 (matching the Fortran X(2,2) passed with LDX=2).
- ddot(N, x, strideX, offsetX, y, strideY, offsetY) takes strides and offsets for both vectors.

## Automation opportunities

- The blocked back-transform (NB>1) could be added as a separate optimization pass. The current NB=1 implementation is correct but not optimal for large N.
- The right and left eigenvector loops have very similar structure. A combined function with a direction parameter could reduce duplication.

## Coverage gaps

- SOMEV path (howmny='S') not covered by dgeev tests since dgeev always uses howmny='B'.
- ALLV path (howmny='A') not covered either.
- Left eigenvector complex pair path exercised only when dgeev requests SIDE='L' or 'B'.
- Blocked back-transform (NB>1) not implemented.

## Complex number handling

- N/A (real routine). Complex eigenvalue pairs are handled by storing real and imaginary parts in separate columns and solving 2-RHS systems via dlaln2.
