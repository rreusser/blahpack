# dsytd2: Translation Learnings

## Translation pitfalls

- TAU array is used as workspace by dsymv (to store w = tau*A*v), then
  modified by daxpy and consumed by dsyr2 and ddot. At the end of each
  loop iteration, `TAU[i] = taui` must be executed to restore the scalar
  reflector factor that was overwritten. Missing this line caused incorrect
  tau output while D and E were correct (since they come from dlarfg/A
  diagonal, not the TAU workspace). This is a classic Fortran pattern where
  an output array doubles as scratch space within the loop body.
- Fortran loop variable mapping: upper case has `DO I = N-1, 1, -1` which
  maps to JS `for (i = N-2; i >= 0; i--)` with Fortran_I = i+1. The
  dsymv/ddot/daxpy/dsyr2 dimension parameter is Fortran_I = i+1, not i.
- The `D[i+1]` and `TAU[i] = taui` assignments are OUTSIDE the
  `if (taui !== 0)` block -- they execute every iteration regardless.

## Dependency interface surprises

- dlarfg signature is `(N, alpha_arr, offsetAlpha, x, strideX, offsetX, tau, offsetTau)` --
  alpha is an array+offset (modified in-place), consistent with
  docs/dependency-conventions.md.
- dsymv is used to write workspace into the TAU array. The output vector
  parameter (y) points to TAU with the appropriate stride/offset. This is
  valid because Fortran DSYTD2 reuses TAU as temporary storage for the
  vector w, then restores the scalar tau value at the end of the loop.

## Automation opportunities

- N/A. The translation was straightforward once the TAU restore bug was
  caught. No mechanical patterns that warrant new transforms.

## Coverage gaps

- 100% line and branch coverage achieved on base.js.
- Both UPLO='U' and UPLO='L' paths are tested with 2x2, 4x4, and 5x5
  matrices, plus diagonal matrices (tau=0 path) and edge cases (N=0, N=1).

## Complex number handling

- N/A. dsytd2 is a real (double-precision) routine. The complex analog
  would be zhetd2.
