# zherfs: Translation Learnings

## Translation pitfalls

- Key difference from zsyrfs: diagonal of Hermitian matrix is real. The Fortran code uses `ABS(DBLE(A(K,K)))` for the diagonal contribution to the backward error bound, not `CABS1(A(K,K))`. Translated as `Math.abs(Av[p])` (real part only) rather than `Math.abs(Av[p]) + Math.abs(Av[p+1])`.
- Off-diagonal elements still use CABS1 (|re|+|im|) for both upper and lower paths.
- zhemv takes Complex128 alpha/beta args, while zsymv does the same. The interface is identical.
- The `packHermitianLower` test helper must pack elements column-by-column (col 0 rows 0..n-1, col 1 rows 1..n-1, etc.), not row-by-row. An initial bug packed them in the wrong order.

## Dependency interface surprises

- zhemv uses the same long-form string convention ('upper'/'lower') as zsymv.
- zhetrs signature matches zsytrs exactly.

## Missing automation

- N/A: direct mirror of zsyrfs with minimal changes.

## Coverage gaps

- FERR values are tested loosely (tolerance 1e-10) because they depend on condition estimation.
- No test for a poorly conditioned matrix where iterative refinement makes a large difference.

## Complex number handling

- No special handling needed beyond what zsyrfs provides. The diagonal-is-real property is the only Hermitian-specific change.
