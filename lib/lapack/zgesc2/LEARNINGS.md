# zgesc2: Translation Learnings

## Translation pitfalls

- zgetc2 is not yet implemented in JS, so Fortran test uses ZGETC2 to factor, and the JS test directly loads the factored A/IPIV/JPIV from the Fortran fixture. IPIV/JPIV must be converted from 1-based (Fortran) to 0-based (JS) in the test.
- The Fortran uses `CALL ZLASWP(1, RHS, LDA, 1, N-1, IPIV, 1)` where RHS is treated as a 1-column matrix with leading dimension LDA. In JS, since RHS is a 1D complex vector with stride 1, the zlaswp call uses `strideRHS` as both strideA1 and strideA2 (the LDA-equivalent for a single-column vector).
- The back substitution computes TEMP = 1/A(I,I) as a complex scalar, then uses it in multiple places. Cannot use cmplx.divAt directly to overwrite RHS(I) because TEMP is also needed for the inner loop. Implemented Smith's formula inline to compute TEMP into local variables.

## Dependency interface surprises

- zlaswp expects complex-element strides (strideA1, strideA2) and does the *2 internally. k1 and k2 are 0-based row indices.
- izamax returns a 0-based index (consistent with the JS convention).
- zscal takes a Complex128 scalar, not separate re/im parts.

## Automation opportunities

- N/A for this routine; the pattern is straightforward.

## Coverage gaps

- The SMLNUM scaling branch (lines 122-127 in base.js) requires near-overflow inputs to trigger: `2*SMLNUM*|RHS(i)| > |A(N,N)|`. This is an overflow guard that requires carefully constructed near-singular matrices. Accepted as uncovered (97.3% line, 87.5% branch).

## Complex number handling

- Inlined complex multiplication (safe) for the forward substitution: `RHS(j) -= A(j,i) * RHS(i)`.
- Inlined complex multiplication for back substitution: `RHS(i) *= TEMP`, `prod = A(i,j) * TEMP`, `RHS(i) -= RHS(j) * prod`.
- Used Smith's formula (manual inline of cmplx.divAt logic) for `TEMP = 1/A(I,I)` to compute into local variables rather than array slots. This is complex division and normally should use cmplx.divAt, but since we need TEMP as separate re/im locals for the inner loop, the inline was necessary.
- Used cmplx.absAt for `|RHS(i)|` and `|A(N,N)|` in the overflow guard (never inline complex absolute value).
