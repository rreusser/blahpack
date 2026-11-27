# dpotrs: Translation Learnings

## Translation pitfalls

- [x] dpotrs is straightforward -- just two dtrsm calls. The key is getting the trans parameter right: for lower, first solve L*Y=B with trans='N', then L^T*X=Y with trans='T'. For upper, first solve U^T*Y=B with trans='T', then U*X=Y with trans='N'. The order of 'T' and 'N' is swapped between upper and lower.
- [x] The Fortran test factorizes in-place before calling dpotrs. The JS test must do the same: call dpotrf first, then dpotrs with the factored matrix.

## Dependency interface surprises

- [x] dpotrs relies entirely on dtrsm. All four dtrsm calls use side='L' (left side), diag='N' (non-unit diagonal), and alpha=1.0.

## Automation opportunities

- [x] N/A. dpotrs is a trivial wrapper around two dtrsm calls.

## Coverage gaps

- [x] 100% line and branch coverage achieved. Both upper and lower paths are tested, along with N=0, NRHS=0 quick returns and 1x1 edge case.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zpotrs) would use conjugate transpose.
