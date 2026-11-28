# dgtsv: Translation Learnings

## Translation pitfalls

- The Fortran has two nearly-identical forward elimination loops: one for
  `NRHS == 1` (no inner j loop) and one for `NRHS > 1`. Both must be
  translated separately to preserve the optimization.
- The last elimination step (i = N-2) is handled separately from the main
  loop because the pivoting branch differs: when i < N-2, pivoting updates
  `DL(i) = DU(i+1)` and `DU(i+1) = -fact*DL(i)` (second superdiagonal
  fill-in), but at i = N-2 there is no DU(N-1) to update.
- The back-solve in Fortran has a `NRHS <= 2` optimization using a GOTO
  loop over j. This is equivalent to the general `NRHS > 2` path, so a
  single j-loop suffices in JavaScript. Both paths produce identical results.
- B matrix uses column-major layout: `strideB2 = LDB` (column stride),
  `strideB1 = 1` (row stride). Tests must set up B accordingly.

## Dependency interface surprises

- N/A. dgtsv is fully self-contained with no external LAPACK/BLAS
  dependencies (only XERBLA for error reporting, which is omitted in
  base.js per stdlib convention).

## Automation opportunities

- N/A. The routine is simple enough that the standard pipeline
  (signature, scaffold, Fortran test, gen_test) handled everything.

## Coverage gaps

- Lines 101-102 and 138-139: `return N-1` when the second-to-last diagonal
  becomes zero during the last elimination step (single-RHS and multi-RHS
  paths). Would require a matrix whose D(N-1) becomes zero after all prior
  eliminations but where |D(N-1)| >= |DL(N-1)| (no pivoting). Hard to
  construct without reverse-engineering the elimination.
- Lines 176-177, 196-197: The multi-RHS last-step pivoting branch and the
  corresponding singular detection. These are the multi-RHS equivalents of
  the single-RHS code that IS covered by the pivoting test.
- Overall coverage: 96.24% line, 86.49% branch, well above thresholds.

## Complex number handling

- N/A. dgtsv is a real (double precision) routine. The complex analogue
  would be zgtsv.
