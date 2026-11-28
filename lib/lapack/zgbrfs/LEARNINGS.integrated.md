# zgbrfs: Translation Learnings

## Translation pitfalls

- Band storage for zgbrfs uses two different layouts: AB (original) with KL+KU+1 rows (diagonal at row KU, 0-based), and AFB (factored, from zgbtrf) with 2*KL+KU+1 rows. The original band entries must be copied into rows KL..2*KL+KU of AFB before calling zgbtrf.
- The Fortran uses CABS1(ZDUM) = ABS(DBLE(ZDUM)) + ABS(DIMAG(ZDUM)) as a statement function. In JS, this is implemented as a helper reading from the Float64 view at index*2.
- TRANS values: Fortran uses 'N'/'T'/'C'; stdlib-js uses 'no-transpose'/'conjugate-transpose'. The transposed counterpart (TRANST/TRANSN) swaps between these.

## Dependency interface surprises

- zgbmv expects Complex128 scalars for alpha/beta, not plain numbers. Must use `new Complex128(-1.0, 0.0)` for CNONE.
- zlacn2 uses reverse communication: V (workspace) at offset N*stride from WORK, X (input/output) at offset 0. EST and KASE are single-element arrays used for in/out communication.
- zgbtrs takes strideB2 as the second-to-last param (before offsetB), representing the column stride of the RHS matrix. For a single-column solve during refinement, pass N*strideWORK as strideB2.

## Automation opportunities

- The copyBandToFactored pattern (copying original AB into AFB rows KL..2*KL+KU for zgbtrf) appears in every band refinement test. Could be a shared test utility.

## Coverage gaps

- Only tested no-transpose and conjugate-transpose (not transpose, which for complex matrices differs from conjugate-transpose). The Fortran ZGBRFS treats 'T' and 'C' identically by mapping both to the non-NOTRAN branch.
- FERR/BERR values are validated with 1e-6 relative tolerance since they are estimates, not exact values.

## Complex number handling

- All complex arrays use Complex128Array with reinterpret() for element-level access via Float64Array views.
- CABS1 is inlined as `Math.abs(v[idx]) + Math.abs(v[idx+1])` for performance, reading directly from the Float64 view.
- The RWORK array is Float64Array (real workspace), separate from the complex WORK array.
- Multiplication of RWORK (real) with WORK (complex) entries is done component-wise: `wv[pw] *= RWORK[...]` for both real and imaginary parts.
