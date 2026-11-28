# dla_lin_berr: Translation Learnings

## Translation pitfalls

- **Two N x NRHS matrix parameters (RES and AYB), no explicit LDA in the Fortran
  signature.** The declarations use `DOUBLE PRECISION RES(N, NRHS)`, so the
  leading dimension is implicitly `N`. The scaffolder's auto-generated signature
  treated each matrix as a 1D strided vector (single stride). This is wrong for
  matrices: the ndarray form was rewritten to take `strideRES1`, `strideRES2`,
  `offsetRES` (and likewise for `ayb`), matching the convention in sibling
  routines such as `dla_gerpvgrw`. The layout wrapper `dla_lin_berr.js` takes
  `LDRES` and `LDAYB` and calls into base as `1, LDRES, 0` / `1, LDAYB, 0`.
- **Fortran test gotcha — fixed-size 2D arrays get remapped.** Declaring
  `double precision :: res(5, 3)` in the driver and calling the subroutine
  with `N=3` causes the callee to address the buffer as a 3x3 matrix with
  leading dimension 3, not 5. This silently mangles columns (col 1 is read
  from positions 3..5 of the physical col 0). The fix was to use
  `allocatable` arrays sized exactly `(n, nrhs)` per test case so the
  physical and logical leading dimensions match.
- **`safe1 = (nz+1) * DLAMCH('Safe minimum')` is negligibly small.** At
  `SAFMIN ~ 2.2e-308`, the guard is only meaningful when residuals are
  themselves subnormal. For ordinary test inputs it does not affect BERR at
  all, so assertions can use tight tolerances.
- **`if (AYB(i,j) != 0.0)` — rows with a zero denominator are skipped.**
  This is documented by a comment in the Fortran: if `AYB` was produced by
  `SLA_yyAMV` and is exactly zero, the true residual is also exactly zero,
  so the ratio contributes nothing.

## Dependency interface surprises

- **`DLAMCH('S')` is module-scope hoisted to `FLOAT64_SMALLEST_NORMAL`.**
  No need to call into a `dlamch` wrapper per invocation; the safe-minimum
  constant is time-invariant.

## Benchmark notes

- The scaffolded benchmark used a wrong argument count for the layout wrapper
  (12 args for a 14-arg ndarray call). Rewrote both `benchmark.js` and
  `benchmark.ndarray.js` to allocate `len * nrhs` sized vectors (nrhs = 1)
  and call the correct signature. No N*N allocation risk — the buffers are
  O(N) even at `len = 1e6`.
