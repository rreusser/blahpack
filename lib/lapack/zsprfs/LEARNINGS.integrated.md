# zsprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing: Fortran uses 1-based KK index that advances by column size. In JS, KK is tracked in float64 (reinterpreted) coordinates, advancing by `(k+1) * strideAP * 2` for upper or `(N-k) * strideAP * 2` for lower.
- The Fortran body uses IK to traverse within a packed column. In JS, IK also operates in float64 space.
- B and X are 2D matrices (multiple RHS), requiring both strideB1/strideB2 and proper column offset `(j * strideB2)` when iterating over NRHS.

## Dependency interface surprises

- zspmv takes Complex128 scalars (alpha, beta), complex-element strides and offsets (not float64-level).
- zsptrs takes the matrix B with `strideB1, strideB2, offsetB` where strideB2 is the LDB equivalent.
- zlacn2 uses reverse-communication pattern with KASE/ISAVE arrays, same as zsyrfs.

## Automation opportunities

- The packed storage |A|*|X| accumulation pattern is identical between dsprfs and zsprfs (modulo complex abs). Could be extracted to a shared helper.

## Coverage gaps

- The `safe2` branches (lines 224-225, 245-246) require very small matrix values near SAFMIN to trigger. The iterative refinement loop (lines 231-234) does not execute because the initial ZSPTRS solve is already machine-precision accurate for well-conditioned test matrices.
- Would need ill-conditioned matrices (close to singular) to force refinement iterations.

## Complex number handling

- Uses CABS1 = |re| + |im| throughout (not modulus) for element-wise absolute values, matching the Fortran CABS1 statement function.
- Symmetric (not Hermitian): no conjugation anywhere. AP is traversed as-is.
- RWORK is Float64Array (real workspace), WORK is Complex128Array.
- All complex array access via `reinterpret()` to get float64 views with `[2*i]` for re and `[2*i+1]` for im.
