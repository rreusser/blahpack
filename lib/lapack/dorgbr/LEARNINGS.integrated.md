# dorgbr: Translation Learnings

## Translation pitfalls

- The Fortran DORGBR calling convention for VECT='P' is subtle: when the
  original matrix was M-by-N with M >= N, dgebrd produces N-1 LQ reflectors
  in the *superdiagonal* rows. For VECT='P', dorgbr is then called with
  M=N, N=N, K=M (the *original* M, not the reflector count). K >= N triggers
  the shift path. Getting these K values right is critical for correct dispatch.
- Similarly for VECT='Q' when M < K: the original call to dgebrd on an
  M-by-N matrix with M < N produces M-1 QR reflectors in the *subdiagonal*
  columns. The shift path moves them right by one column and places a 1 in
  the top-left corner.
- The column/row shift loops translate directly from Fortran to 0-based JS.
  The Fortran DO loops with step -1 correspond to downward-counting JS for
  loops. The key insight is that the Fortran `A(1,J)=ZERO` becomes
  `A[offsetA + j*strideA2] = 0.0` (row 0, column j) in 0-based indexing.

## Dependency interface surprises

- dorgqr and dorglq both allocate WORK internally (ignore the WORK/lwork
  parameters passed from the caller). This means dorgbr does not need to
  worry about workspace sizing at all -- just pass dummy WORK arrays.
- The submatrix offset for the shift paths (`A(2,2)` in Fortran) translates
  to `offsetA + strideA1 + strideA2` in JS, consistent with zungbr.

## Automation opportunities

- This translation was a straightforward real analog of zungbr. The pattern
  of adapting a z-prefix routine to d-prefix (dropping reinterpret, complex
  arithmetic) could potentially be semi-automated for simple wrapper routines
  like this.

## Coverage gaps

- 100% line, branch, and function coverage achieved on base.js.
- All four code paths tested: VECT=Q with M>=K, VECT=Q with M<K,
  VECT=P with K<N, VECT=P with K>=N.

## Complex number handling

- N/A -- this is a real (double precision) routine. No complex arithmetic.
