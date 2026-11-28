# zpotri: Translation Learnings

## Translation pitfalls

- Nearly identical to dpotri. The only difference is replacing dtrtri/dlauum with ztrtri/zlauum, and the Fortran comment changes from "inv(U)**T" to "inv(U)**H" (conjugate transpose vs transpose).
- Test setup requires calling zpotrf first to produce the Cholesky factor, then zpotri to invert. The fixture comparison must account for the fact that zpotrf only stores the relevant triangle and the other triangle contains stale data from the original matrix.
- The `verifyInverse` test helper reconstructs the full Hermitian matrix from the stored triangle to compute A * A_inv and check it equals I.

## Dependency interface surprises

- `ztrtri(uplo, diag, N, A, strideA1, strideA2, offsetA)` -- takes same signature as complex routines, strides in complex elements.
- `zlauum(uplo, N, A, strideA1, strideA2, offsetA)` -- same.
- Both return integer info. No complex scalar parameters.

## Automation opportunities

- The pattern dpotri -> zpotri is exactly mechanical: replace `d` prefix deps with `z` prefix deps, change "transpose" comment to "conjugate transpose". Could be automated for future d -> z translations.

## Coverage gaps

- 100% line and branch coverage achieved. The singular matrix early-return path (info > 0 from ztrtri) is tested with a matrix that has a zero diagonal entry.

## Complex number handling

- No complex arithmetic in zpotri itself; it's a pure driver that calls ztrtri and zlauum.
