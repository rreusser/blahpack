# dla_syrpvgrw: Translation Learnings

## Translation pitfalls

- The INFO parameter is an input (not output) in this routine -- it tells the function which column had a zero pivot from dsytrf. The signature generator consumed INFO as a return value, so it had to be manually added back to the signature in base.js, ndarray.js, and dla_syrpvgrw.js.
- The Fortran 2x2 pivot loop `DO I = K+1, N` (1-based) requires careful 0-based translation. Initially wrote `for (i = k+2; ...)` which is incorrect; the correct translation is `for (i = k+1; ...)` because k is already 0-based (k = K-1). Similarly, `DO I = 1, K-1` (1-based) maps to `for (i = 0; i < k; ...)` in 0-based, not `for (i = 0; i <= k-2; ...)`.
- The IPIV conversion from Fortran to JS: positive values subtract 1 (1-based to 0-based), negative values are unchanged because Fortran `-p` (1-based) equals JS `~(p-1) = -p`.

## Dependency interface surprises

- N/A: this is a leaf routine with no BLAS/LAPACK dependencies (only LSAME, which becomes a string comparison).

## Automation opportunities

- The signature generator should recognize when INFO is an input parameter (not output). In dla_syrpvgrw and other `_rpvgrw` routines, INFO is explicitly documented as an input from the caller's factorization.

## Coverage gaps

- The upper first-pass while loop (Fortran: K=N, DO WHILE K<NCOLS) is provably dead code. K starts at N and NCOLS is always <= N, so the condition K<NCOLS never holds. Documented with inline TODO.
- The upper final rpvgrw computation loop never executes its inner branch (umax !== 0) because the dead first-pass loop means WORK[0..N-1] stays zero. Documented with inline TODO.
- The lower 2x2 diagonal update branch (`|AF[k,k]| > WORK[k]`) is hard to trigger because DSYTRF selects 2x2 pivots precisely when the off-diagonal dominates the diagonal. Documented with inline TODO.

## Complex number handling

- N/A: dla_syrpvgrw is a real-valued routine.
