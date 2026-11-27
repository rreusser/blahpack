# zposv: Translation Learnings

## Translation pitfalls

- Trivial driver routine: just calls zpotrf + zpotrs. Direct mirror of dposv.
- uplo parameter uses single char ('U'/'L') matching Fortran convention, consistent with zpotrf/zpotrs expectations.

## Dependency interface surprises

- zpotrf and zpotrs both accept Complex128Array with complex-element strides. No stride doubling needed at the driver level.
- zpotrf returns info > 0 when the leading minor of order k is not positive definite. The exact value of info depends on the factorization path.

## Automation opportunities

- The scaffold generator produced a correct base.js from the dposv template with Hermitian-specific comments (U^H instead of U^T). No manual edits needed.
- Same observation as zgesv: complex test input setup could be automated.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- Both 'U' and 'L' uplo paths are tested.
- Non-positive-definite test only checks info > 0 (not exact value).

## Complex number handling

- No complex arithmetic in this driver; all complex work is delegated to zpotrf/zpotrs.
- Tests use Complex128Array inputs with reinterpret() for Float64 comparison against fixtures.
- Hermitian matrix setup requires conjugate symmetry: A(i,j) = conj(A(j,i)). The Fortran test uses the full matrix; zpotrf only reads the specified triangle.
