# zpotrf2: Translation Learnings

## Translation pitfalls

- The N=1 base case must extract the real part of A[0,0] via the Float64Array view (Av[oA]) and check that it is positive and not NaN. The result is `sqrt(Re(A[0,0]))` with imaginary part set to zero.
- The NaN check `ajj !== ajj` works identically to Fortran's DISNAN call.
- The info return from recursive calls to A22 must be offset by n1: `return iinfo + n1` to produce the correct 1-based column index of the failure.
- The submatrix offset arithmetic is identical to the real dpotrf2 case: A11 at `offsetA`, A12/A21 at `offsetA + n1*sa2` (upper) or `offsetA + n1*sa1` (lower), A22 at `offsetA + n1*sa1 + n1*sa2`.

## Dependency interface surprises

- ztrsm takes a Complex128 scalar for alpha (CONE = new Complex128(1.0, 0.0)), while zherk takes a plain real number for alpha/beta. This asymmetry matches the Fortran signatures exactly.
- The upper case calls ztrsm with side='L', transa='C' (conjugate transpose) to solve U11^H * X = A12. The lower case calls ztrsm with side='R', transa='C'. These mirror the dpotrf2 calls with 'T' replaced by 'C'.
- zherk is called with trans='C' for upper and trans='N' for lower, matching the dpotrf2 pattern of dsyrk with 'T'/'N'.

## Automation opportunities

- The translation from dpotrf2 to zpotrf2 is highly mechanical: replace Float64Array with Complex128Array, dsyrk->zherk, dtrsm->ztrsm, transpose->'C' (conjugate transpose), and add the N=1 complex-specific base case. Could be automated for future real->complex LAPACK pairs.

## Coverage gaps

- 100% line, 100% branch within the zpotrf2 test context. The A22-block error return path for upper is tested via the "not posdef in A22 block" test case.

## Complex number handling

- Only the N=1 base case directly accesses complex elements via Float64Array view. All other operations are delegated to ztrsm and zherk, which handle their own complex arithmetic internally.
- The CONE constant (new Complex128(1.0, 0.0)) is created once at module scope and reused for all ztrsm calls.
