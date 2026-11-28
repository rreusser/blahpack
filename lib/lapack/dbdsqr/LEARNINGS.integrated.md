# dbdsqr: Translation Learnings

## Translation pitfalls

- Translated directly from the existing zbdsqr JS implementation, which served as the primary reference (not the raw Fortran). This was a near-mechanical mapping: replace complex BLAS routines (zdrot/zdscal/zswap/zlasr) with real counterparts (drot/dscal/dswap/dlasr), and Float64Array replaces Complex128Array throughout.
- The WORK array in dbdsqr uses `strideWORK`/`offsetWORK` parameters, whereas zbdsqr calls it `RWORK` (real workspace alongside complex matrix parameters). Same underlying data.
- The Fortran deps file needed `ieeeck` added manually (transitive dependency through `ilaenv` -> `dlasq2`). The `bin/init_routine.py` auto-generated deps missed this.

## Dependency interface surprises

- `dlasr` has the same interface as `zlasr` but operates on Float64Array instead of Complex128Array. No stride convention differences.
- `drot` signature is `(N, x, strideX, offsetX, y, strideY, offsetY, c, s)` vs zdrot which is similar but operates on complex arrays.
- `dscal` is `(N, da, x, strideX, offsetX)` vs zdscal.
- No surprises since all deps matched zbdsqr's real-valued deps exactly.

## Automation opportunities

- Translating zbdsqr -> dbdsqr was mechanical: s/zlasr/dlasr/, s/zdrot/drot/, s/zdscal/dscal/, s/zswap/dswap/, s/RWORK/WORK/, remove Complex128Array/reinterpret patterns. Could be scripted for future z->d routine pairs.
- The Fortran test was a mechanical adaptation of test_zbdsqr.f90: remove complex declarations, replace complex*16 with double precision, remove EQUIVALENCE blocks. Also scriptable.

## Coverage gaps

- Lines 192-193: dlasq1 returning 2 (convergence failure fallthrough to QR iteration). Requires inputs that make dqds fail but QR succeed -- contrived.
- Lines 268-269: Negative `tol` threshold path. Requires calling with negative tolerance, which is unusual.
- Lines 294-304: Non-convergence (MAXIT exceeded). Requires a matrix that fails to converge in 6*N*N iterations.
- Lines 310-311, 320-321: Negative tol zeroing of negligible D entries. Same negative-tol constraint.
- Lines 414-416, 435-437, 445-447: Convergence test boundary cases for negative tol path.
- Lines 487-488: `(shift/sll)^2 < eps` shift-negligibility test. Hard to trigger precisely.
- Final coverage: 95.76% line, 86.09% branch -- exceeds targets.

## Complex number handling

- N/A: dbdsqr is purely real. All matrices (VT, U, C) are Float64Array. No complex arithmetic needed.
