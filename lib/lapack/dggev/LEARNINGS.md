# dggev: Translation Learnings

## Translation pitfalls

- The dormqr call uses `'transpose'` (Fortran 'T'), not `'no-transpose'`. Getting this wrong produces completely wrong eigenvalues since Q^T * A differs fundamentally from Q * A.
- dggbal returns 1-based ilo/ihi. dgghrd and dggbak expect 1-based ilo/ihi, but dhgeqz takes 0-based ilo/ihi. Must subtract 1 when passing to dhgeqz.
- Workspace is allocated internally (LWORK/WORK removed from signature). Minimum workspace is 8*N.
- Eigenvectors are only defined up to a scalar multiple; normalization by infinity-norm can produce different signs than Fortran. Tests must compare eigenvector columns allowing sign flips.

## Dependency interface surprises

- dhgeqz takes 0-based ilo/ihi despite the JSDoc comment claiming "1-based from caller, converted to 0-based internally." The code uses them directly as 0-based indices.
- dggbal returns an object `{ info, ilo, ihi }` (1-based), not just an integer info code.
- dtgevc's `M` parameter (number of eigenvectors computed) is marked "(unused, set internally)" in the JS implementation, so pass 0 for it.
- String mappings for dgghrd/dhgeqz: when dggev requests eigenvectors ('compute-vectors'), pass 'update' to dgghrd/dhgeqz compq/compz since VL/VR are already initialized.

## Lint/tooling

- Do NOT use `var` inside blocks (if/for) in stdlib convention code. The codemod linter will hoist them to the top of the function, breaking code that depends on runtime values. Declare all variables at the function top.
- ESLint OOMs when linting the full module directory. All individual files pass with 0 errors.
