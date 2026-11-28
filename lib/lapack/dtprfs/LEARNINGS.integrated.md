# dtprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing uses `kc` cursor, advancing by `k+1` (upper) or
  `N-k` (lower) per column. The inner loop index `(kc + i)` for upper and
  `(kc + i - k)` for lower replaces Fortran's `AP(KC+I-1)` / `AP(KC+I-K)`.
- The no-lonely-if ESLint rule requires flattening the Fortran's
  `else { if (upper) ... else ... }` into `else if (upper) ... else ...`,
  which reduces indentation depth.
- The lint-fix.sh script can clobber test files with unrelated boilerplate
  when the test file uses fixtures and not the scaffold structure. Run it
  only on the lib/ directory, or manually fix lint issues.

## Dependency interface surprises

- dtpmv/dtpsv use 1D packed stride/offset API:
  `dtpmv(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)`.
  This is simpler than dtrmv/dtrsv (no strideA1/strideA2).
- dlacn2 signature: `dlacn2(N, V, strideV, offsetV, X, strideX, offsetX,
  ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE)`.
  EST and KASE are passed as single-element typed arrays for reverse
  communication state.

## Automation opportunities

- The lint-fix script's codemod-tests.js overwrites test files that don't
  match the expected scaffold pattern. Test files using fixture-based
  patterns should be excluded from codemods.

## Coverage gaps

- All 8 branch combinations (upper/lower x no-transpose/transpose x
  unit/non-unit) are covered, plus multi-RHS, N=0, and N=1.
- BERR is always 0 because the test solutions are exact. A test with
  perturbed X would exercise the BERR > 0 path, but the current tests
  adequately verify correctness against Fortran reference output.

## Complex number handling

- N/A: dtprfs is a real-valued routine.
