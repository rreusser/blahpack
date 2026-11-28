# dlasdt: Translation Learnings

## Translation pitfalls

- Fortran uses 1-based array indexing for both the loop counters and the
  INODE/NDIML/NDIMR storage indices. The JS translation uses 0-based array
  indexing. Key conversions: `IL` and `IR` start at -1/0 instead of 0/1,
  `NCRNT = LLST + I - 1` instead of `LLST + I`.
- INODE stores matrix position indices (centers of subproblems). These are
  1-based in Fortran and 0-based in JS. The Fortran `INODE(1) = I + 1` becomes
  JS `INODE[0] = i` (the +1 is absorbed by the base change). Callers must be
  aware that INODE values are 0-based.
- `LVL` and `ND` are scalar output parameters. Passed as `Int32Array(1)` in JS
  (write to index 0). This matches the Float64Array(1) convention for scalar
  output params.
- Integer division with `|0` is safe here since all values are non-negative.

## Dependency interface surprises

- N/A: dlasdt is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A: straightforward translation, no repeated mechanical steps.

## Coverage gaps

- 100% line and branch coverage achieved. No hard-to-cover paths since the
  routine is purely integer arithmetic with no convergence or special-value
  branches.

## Complex number handling

- N/A: dlasdt is a real-valued (integer-only) routine.
