# dtbrfs: Translation Learnings

## Translation pitfalls

- Band storage indexing: For upper triangular, Fortran uses `AB(kd+1+i-j, j)` which maps to 0-based `AB[offsetAB + (kd+i-k)*strideAB1 + k*strideAB2]`. For lower triangular, `AB(1+i-j, j)` maps to `AB[offsetAB + (i-k)*strideAB1 + k*strideAB2]`.
- The `no-lonely-if` ESLint rule requires restructuring nested `else { if (...) }` into `else if (...)`, which flattens the Fortran control flow structure.
- NZ (max nonzeros per row + 1) is `kd + 2` for band matrices, unlike `N + 1` for full/packed triangular (dtrrfs/dtprfs).

## Dependency interface surprises

- dtbmv and dtbsv take the same band storage parameters (uplo, trans, diag, N, K, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX). The `K` parameter corresponds to `kd` (bandwidth).
- dlacn2 reverse-communication interface requires EST, KASE, and ISAVE arrays allocated outside the loop and reset per RHS column.

## Automation opportunities

- The lint-fix script (`bin/lint-fix.sh`) can clobber test files entirely if they don't follow stdlib conventions. Need to be careful about running it on test files vs lib files.

## Coverage gaps

- All 8 code paths (upper/lower x unit/non-unit x no-transpose/transpose) are covered.
- Edge cases: N=0, N=1, multiple RHS all tested.
- Exact solutions produce BERR=0 and very small FERR (machine-epsilon level).

## Complex number handling

- N/A: dtbrfs is a real-valued routine.
