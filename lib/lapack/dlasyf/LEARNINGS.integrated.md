# dlasyf: Translation Learnings

## Translation pitfalls

- **KW column index off-by-one**: The Fortran `KW = NB + K - N` uses 1-based K. In 0-based JS with k = K-1, the correct formula is `kw = nb + k - N` (NOT `nb + k - N + 1`). Getting this wrong causes out-of-bounds writes on the workspace W array. JavaScript typed arrays silently ignore OOB writes, making this bug invisible in small test cases but catastrophic in larger blocked factorizations.
- **Loop termination for lower case**: Fortran checks `K >= NB` at the TOP of the loop (1-based K starting at 1). In 0-based, the equivalent is `k >= nb - 1`. This means the loop processes nb-1 columns (0 through nb-2), NOT nb columns.
- **KB return value**: For upper case, `kb = N - k - 1` where k is the 0-based loop variable at exit. For lower case, `kb = k` (the loop variable at exit equals the number of processed columns).
- **Signature difference from Fortran**: KB is an output parameter in Fortran. In JS, dlasyf returns `{ info, kb }` instead of using a mutable parameter.

## Dependency interface surprises

- dgemm is called with 'N' and 'T' for the trailing update, using the stride/offset API. The W matrix uses sw1=1, sw2=ldwork (column-major).
- dgemv is called with the W matrix, where stride across rows (sw2) steps through columns of W. This is the "walk along row" pattern.

## Automation opportunities

- N/A.

## Coverage gaps

- Singular column path (info set within dlasyf) is untested. Requires a matrix with a zero column after W updates.
- The kp=imax with kstep=1 branch (interchange to 1x1 pivot after row scan) requires a specific matrix where |A(imax,imax)| >= ALPHA*rowmax but absakk < ALPHA*colmax*(colmax/rowmax).
- Trailing update paths with j-loop spanning multiple NB blocks are untested with small matrices.
- Overall branch coverage: 78.46% -- the uncovered branches are rare pivoting decisions and edge cases.

## Complex number handling

- N/A: dlasyf is a real-valued routine.
