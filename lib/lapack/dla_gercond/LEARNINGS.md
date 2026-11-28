# dla_gercond: Translation Learnings

## Translation pitfalls

- The routine does NOT call `dla_geamv` despite the task description suggesting
  it. The absolute-value matrix-vector multiply is done inline with simple loops
  over A, with cmode-dependent scaling (multiply by C, divide by C, or no scaling).
- The transpose case swaps row/column iteration of A (A[j,i] instead of A[i,j]),
  which maps cleanly to swapping strideA1 and strideA2 usage.
- Fortran IPIV is 1-based; JS dgetrf produces 0-based IPIV. Test setup must use
  dgetrf directly rather than hardcoding Fortran IPIV values.
- The `deps_dla_gercond.txt` needed manual additions of `dgetrf`, `dgetrf2`, and
  `dlamch` for Fortran test compilation, as the routine itself only calls `dgetrs`
  and `dlacn2` but the test program calls `dgetrf`.

## Dependency interface surprises

- `dgetrs` takes B strides as `(strideB1, strideB2)` where strideB2 is the
  column stride for the RHS matrix. For a single RHS column, pass
  `(strideWORK, N * strideWORK)` to treat WORK as an N-by-1 matrix.
- `dlacn2` has an ISGN parameter (Int32Array) that is used internally as workspace.
  The caller's IWORK serves this purpose. EST and KASE must be single-element
  typed arrays (Float64Array(1) and Int32Array(1)) for reverse communication.
