# dgelq2: Translation Learnings

## Translation pitfalls

- The Fortran `MIN(I+1, N)` for the x-vector offset in dlarfg must be translated carefully: in 0-based JS it becomes `Math.min(i + 1, N - 1)`. This prevents out-of-bounds access when i is the last column index.
- dgelq2 is structurally identical to dgeqr2 but operates on rows instead of columns. The reflector vector runs along strideA2 (column direction) rather than strideA1 (row direction).
- Near-zero trailing submatrices (e.g., a 3x4 matrix whose rows are nearly linearly dependent) cause the final reflector to be numerically arbitrary. Fixture-based tests must use well-conditioned matrices where all reflectors are numerically significant.

## Dependency interface surprises

- `dlarf` takes tau as a plain scalar number, NOT as (array, offset). This differs from `zlarf` which takes tau as (Float64Array, offset).
- `dlarfg` takes alpha as (array, offset) and tau as (array, offset) -- both are modified in place.
- The v-vector passed to dlarf('R', ...) uses strideA2 as its stride, since for LQ the reflector is stored in a row of A.

## Automation opportunities

- N/A. This was a straightforward translation from the zgelq2 pattern, removing complex conjugation (zlacgv calls) and simplifying complex arithmetic to real arithmetic.

## Coverage gaps

- N/A. Achieved 100% line and branch coverage on base.js. All paths are exercised: M < N, M > N, M = N, M = 1, N = 1, M = 0, N = 0, M = N = 1.

## Complex number handling

- N/A. dgelq2 is a real routine (d-prefix). No complex arithmetic involved. The complex analog zgelq2 was used as the structural template but all complex-specific code (zlacgv, reinterpret, complex strides) was removed.
