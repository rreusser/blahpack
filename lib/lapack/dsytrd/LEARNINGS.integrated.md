# dsytrd: Translation Learnings

## Translation pitfalls

- The Fortran code uses ILAENV for block size (NB), crossover point (NX), and minimum block size (NBMIN). In JS, NB=32 is hardcoded and NX=NB. The LWORK/workspace sizing logic is removed entirely since WORK is allocated internally.
- The Fortran upper-triangle loop runs backwards: `DO I = N-NB+1, KK+1, -NB` (1-based). Converting to 0-based: `i = N-nb` down to `i >= kk`, stepping by `-nb`. The KK formula `KK = N - ((N-NX+NB-1)/NB)*NB` translates directly using `Math.floor`.
- The Fortran lower-triangle loop `DO I = 1, N-NX, NB` becomes `i = 0; while (i <= N-nx-1)` in 0-based. The variable `i` after the loop is used for the final dsytd2 call, so a `while` loop (not `for`) preserves `i` in the correct scope.
- The WORK array for dlatrd is N-by-NB with column-major strides (1, N). In the lower-triangle case, `WORK(NB+1)` in Fortran (1-based) maps to `work[nb]` (0-based, row offset) passed as the offset to dsyr2k.

## Dependency interface surprises

- dlatrd's W parameter uses (strideW1, strideW2, offsetW) like a 2D matrix. The WORK array passed from dsytrd serves as this W matrix with strides (1, ldwork=N).
- dsyr2k expects both A and B matrices. In dsytrd, A's columns serve as V (the reflector vectors) and WORK serves as W (the panel from dlatrd).
- For the unblocked fallback (N <= NB), dsytd2 can be called directly on the full matrix without any WORK allocation, making the fast path efficient.

## Automation opportunities

- The deps file needed manual addition of ilaenv, ieeeck, iparmq for Fortran compilation. These ILAENV dependencies are common across all blocked LAPACK routines. Could automate detection by scanning for ILAENV calls in dependency chain.

## Coverage gaps

- 100% line and 100% branch coverage achieved on base.js.
- Both unblocked path (N=4, N=1, N=0) and blocked path (N=35 > NB=32) tested for both UPLO='U' and UPLO='L'.

## Complex number handling

- N/A: dsytrd is a real-valued routine. The complex analog is zhetrd.
