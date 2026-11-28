# LEARNINGS: zggbal Translation

## Routine Summary

- **Source**: `data/lapack-3.12.0/SRC/zggbal.f` (569 lines, 356 code body)
- **Complexity**: 26 GOTOs, 3 algorithm phases, complex interleaved arrays
- **Dependencies**: daxpy, ddot, dscal (real BLAS), izamax, zdscal, zswap (complex BLAS), dlamch
- **Coverage**: 99.06% line, 98.02% branch

## GOTO Restructuring Strategy

The 26 GOTOs fell into these patterns:

### 1. Computed GOTO (label 180)
```fortran
GO TO ( 20, 90 ) IFLOW
```
This dispatches based on `IFLOW` -- after a permutation swap, control returns to either the row search (IFLOW=1) or the column search (IFLOW=2). Restructured as nested while loops with the row search as the outer loop and column search as an inner loop. After each swap, `break` from the appropriate loop to restart.

### 2. Row/column isolation loops (labels 20-80, 90-150)
These search for rows/columns with a single nonzero entry. The pattern is:
- Inner loop scans for first nonzero
- If found, second inner loop checks if any more exist
- If single nonzero: jump to permutation code
- If multiple: continue outer loop

Restructured using `continue` for the "multiple nonzeros" case and a found flag for the "single nonzero" case.

### 3. Skip-ahead GOTOs in scaling (labels 210, 220)
```fortran
IF( A(I,J).EQ.CZERO ) THEN
   TA = ZERO
   GO TO 210
END IF
TA = LOG10( CABS1( A(I,J) ) ) / BASL
210 CONTINUE
```
Became simple if/else blocks.

### 4. Skip-ahead GOTOs in matrix-vector product (labels 280, 310)
```fortran
IF( A(I,J).EQ.CZERO ) GO TO 280
KOUNT = KOUNT + 1
SUM = SUM + WORK(J)
280 CONTINUE
IF( B(I,J).EQ.CZERO ) GO TO 290
```
These are conditional skips within inner loops. Restructured as `if (!czero(...)) { ... }`.

### 5. Conjugate gradient iteration loop (label 250)
```fortran
250 CONTINUE
...
IF( IT.LE.NRP2 ) GO TO 250
```
Classic do-while loop with two exit conditions (gamma=0 or cmax<0.5 or iteration limit). Became `while (true) { ... if (cond) break; }`.

### 6. Direct jump to scaling phase (label 190)
```fortran
IF( LSAME(JOB,'S') ) GO TO 190
```
Handled by early return to `doScaling()` function.

## Key Decisions

### Complex Array Layout
Complex matrices use interleaved real/imaginary pairs in Float64Array:
- Element (i,j) real: `A[offsetA + i*strideA1 + j*strideA2]`
- Element (i,j) imag: `A[offsetA + i*strideA1 + j*strideA2 + 1]`
- Column-major: strideA1=2, strideA2=2*N

### BLAS Stride Mapping
Fortran BLAS routines (zswap, zdscal, izamax) use strides in units of complex elements. Our JS implementations also use complex-element strides. The mapping is:
- Fortran stride LDA -> JS stride = strideA2/2 (for row traversal)
- Fortran stride 1 -> JS stride = strideA1/2 (for column traversal)

### Return Value
ILO and IHI are output scalar parameters in Fortran. Since JS cannot modify scalar arguments, the function returns `{ info, ilo, ihi }` (all 1-based, matching Fortran convention).

### Math.sign vs Fortran SIGN
Fortran's `SIGN(A,B)` returns `|A| * sign(B)`. JavaScript's `Math.sign(x)` returns -1, 0, or 1. For the expression `SIGN(HALF, LSCALE(I))`, we use `Math.sign(LSCALE[...]) * HALF`, which is equivalent since HALF is positive.

Actually, I used `Math.sign(LSCALE[oL + i * sL]) * HALF` implicitly via the expression:
```js
ir = Math.trunc( LSCALE[...] + Math.sign(LSCALE[...]) * HALF )
```
This matches Fortran `INT(LSCALE(I) + SIGN(HALF, LSCALE(I)))` which rounds to nearest integer.

### ILO=IHI Edge Case in Scaling
When the permutation phase isolates all but one eigenvalue (ilo=ihi), the scaling phase should return immediately with scale=1. This edge case (lines 428-431) is hard to trigger with test inputs because it requires a matrix where permutation reduces to exactly one active row/column that doesn't require scaling.

## Uncovered Lines (2%)
- Lines 428-431: `ilo === ihi` branch in scaling phase (rare: requires permutation to leave exactly one active row)
- Lines 585-586: Iteration limit exceeded in conjugate gradient (requires specially constructed matrices where convergence is very slow)

## Test Design

13 test cases covering:
- Quick returns: N=0, N=1, JOB='N'
- Permutation only (JOB='P'): 4x4 bidiagonal, 3x3 with isolated eigenvalue, 3x3 diagonal (full isolation), 5x5 with two isolated eigenvalues
- Scaling only (JOB='S'): 3x3 with varying magnitudes, 2x2 trivial (scales=1)
- Both (JOB='B'): 4x4 complex, 5x5 pentadiagonal, 2x2 dense complex, 3x3 dense complex

All validated against Fortran reference fixtures (JSONL).
