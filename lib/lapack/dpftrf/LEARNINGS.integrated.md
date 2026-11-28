# dpftrf: Translation Learnings

## Translation pitfalls

- Direct adaptation from zpftrf. The real version is simpler: no Complex128 types, scalar alpha/beta are plain doubles, `dsyrk` instead of `zherk`, `'transpose'` instead of `'conjugate-transpose'`.
- The RFP format offset arithmetic maps directly: Fortran `A(k)` becomes `offsetA + (sa * k)` where `sa = strideA`.
- The leading dimension (LDA) in each sub-call maps to `strideA2 = sa * LDA` while `strideA1 = sa`.

## Dependency interface surprises

- `dsyrk` and `dtrsm` use 2D stride conventions (strideA1, strideA2, offsetA) matching the column-major view into the 1D RFP array.
- `dpotrf` also uses 2D strides, so the mapping from Fortran LDA is consistent across all three deps.

## Automation opportunities

- The zpftrf-to-dpftrf translation is entirely mechanical: replace `zherk` with `dsyrk`, `ztrsm` with `dtrsm`, `zpotrf` with `dpotrf`, remove `Complex128` import, use `1.0` instead of `CONE`, and replace `'conjugate-transpose'` with `'transpose'`.
- The Fortran test follows the same pattern as zpftrf but uses `dtrttf` instead of `ztrttf` and real arrays instead of complex.

## Coverage gaps

- 93.77% line coverage. The uncovered lines are early-return paths (`if (info > 0) return info`) after the *first* dpotrf call in each of the 8 code paths. These require a matrix where the first block sub-factorization fails, which is a narrow edge case. The not-positive-definite tests cover the second dpotrf failure path (info + n1 / info + k).

## Complex number handling

- N/A: dpftrf is a real-valued routine.
