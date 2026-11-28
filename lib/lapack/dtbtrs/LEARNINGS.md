# dtbtrs: Translation Learnings

## Translation pitfalls

- Band storage index mapping requires care: for upper triangular, the diagonal is at row `kd` (0-based), i.e. `AB[offsetAB + kd*strideAB1 + j*strideAB2]`. For lower triangular, the diagonal is at row 0, i.e. `AB[offsetAB + j*strideAB2]`. Getting this wrong produces incorrect singularity checks.
- The singularity check uses the Fortran loop variable INFO as the loop counter (reusing it to return the 1-based index of the zero diagonal). In JS, we use a separate loop variable `j` and return `j + 1`.

## Dependency interface surprises

- dtbsv (the sole dependency) takes a stride for the x vector directly and solves column-by-column. The calling convention was straightforward: `dtbsv(uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX)`. No surprises.

## Automation opportunities

- The `--fix` flag on `bin/lint.sh` handles most formatting issues (array-element-newline, empty-line-before-comment, require ordering). Running it early saves time.
- The d-prefix conjugate-transpose lint rule caught a JSDoc mention of `'conjugate-transpose'` that should be `'transpose'` for a real routine.

## Coverage gaps

- 100% line and branch coverage achieved. The routine is simple (singularity check + loop calling dtbsv), so all paths are easily exercised.

## Complex number handling

- N/A: dtbtrs is a real-valued routine.
