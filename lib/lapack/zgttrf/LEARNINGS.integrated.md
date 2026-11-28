# zgttrf: Translation Learnings

## Translation pitfalls

- Complex division `a/b` must save the numerator before overwriting shared arrays. In the row-interchange branch, D(i+1) is read for DU(i) assignment and also used in the D(i+1) update -- must save d1r/d1i before overwriting.
- CABS1 comparison (|re|+|im|) is used for pivoting, not cabs (Euclidean norm).
- IPIV is 0-based in JS (vs 1-based in Fortran). The `IPIV(I) = I+1` in Fortran becomes `IPIV[ip] = i + 1` where i is 0-based.

## Dependency interface surprises

- N/A -- leaf routine with no dependencies.

## Missing automation

- Complex tridiagonal factorization is a direct mirror of dgttrf with CABS1 pivoting and complex division. Could be auto-generated from the real version.

## Coverage gaps

- No standalone Fortran test for zgttrf was written; it is tested implicitly through zgtts2/zgttrs/zgtcon tests.

## Complex number handling

- All complex divisions are inlined since they are simple `a/b = (ar*br+ai*bi, ai*br-ar*bi)/(br^2+bi^2)` without overflow concerns for well-conditioned tridiagonal matrices. For production use, consider dladiv-style safe division.
