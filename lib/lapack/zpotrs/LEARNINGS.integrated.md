# zpotrs: Translation Learnings

## Translation pitfalls

- The key difference from dpotrs is using 'C' (conjugate transpose) instead of 'T' (transpose). For Hermitian matrices, A = U^H * U or A = L * L^H, so the triangular solves use conjugate transpose, not plain transpose.
- For upper: first solve U^H * Y = B with trans='C', then U * X = Y with trans='N'. For lower: first solve L * Y = B with trans='N', then L^H * X = Y with trans='C'.
- The alpha parameter for ztrsm is Complex128 CONE = (1.0, 0.0), not a scalar 1.0 as in the real dpotrs.

## Dependency interface surprises

- ztrsm takes a Complex128 alpha scalar, not a plain number. This is the only API difference vs dtrsm for this use case.
- All four ztrsm calls use side='L', diag='N', alpha=CONE -- identical structure to dpotrs, just with 'C' replacing 'T'.

## Automation opportunities

- The pattern of translating a real routine (dpotrs) to its complex analog (zpotrs) by replacing dtrsm->ztrsm, Float64Array->Complex128Array, and 'T'->'C' is mechanical. A template or code-mod could automate this for future real-to-complex translations of driver routines.

## Coverage gaps

- 100% line and branch coverage achieved. Both upper and lower paths tested, along with N=0, NRHS=0 quick returns, 1x1 edge case, and multiple RHS.

## Complex number handling

- No inline complex arithmetic needed. All complex operations are handled by ztrsm internally. zpotrs only passes through Complex128Array parameters and uses a CONE constant.
