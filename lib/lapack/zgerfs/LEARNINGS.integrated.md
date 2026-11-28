# zgerfs: Translation Learnings

## Translation pitfalls
- Key difference from dgerfs: WORK is Complex128Array, RWORK is Float64Array (dgerfs only has real WORK/IWORK)
- The transpose for error bound estimation uses 'conjugate-transpose' (A^H) for complex, vs 'transpose' for real
- zgemv takes Complex128 scalars (CONE, CNEGONE), not plain numbers
- The zgetrs strideB2 parameter (leading dimension for the RHS) must be set correctly: for a single-column solve with WORK, pass strideWORK * N
- CABS1 used for backward error computation: operates on Float64 view of complex arrays
- The RWORK array stores real componentwise bounds, while WORK stores complex residuals - must not confuse the two

## Dependency interface surprises
- zcopy, zaxpy take Complex128Array with complex-element strides (same convention as zgetrs)
- zgemv alpha/beta are Complex128 objects, not numbers
- zlacn2 V and X are Complex128Array segments within the same WORK array

## Missing automation
- The real-to-complex zgerfs pattern could be partially automated: replace scalar operations with CABS1, add RWORK separate from WORK, change transpose to conjugate-transpose

## Coverage gaps
- Lines 243-244, 250-258: the dlacn2 KASE=1 path where transpose solve is applied. Hard to force deterministically.
- Lines 272-273: the FERR normalization when lstres=0 (all-zero solution). Would need a zero-RHS edge case.

## Complex number handling
- CABS1 inlined for backward error: |re(z)| + |im(z)|
- Real-scalar times complex for RWORK scaling of WORK: must scale both re and im parts
- Complex128 constants (CONE, CNEGONE) allocated at module scope to avoid per-call allocation
