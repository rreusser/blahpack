# dtrrfs: Translation Learnings

## Translation pitfalls

- dtrrfs uses a reverse-communication interface with dlacn2 for condition
  estimation. The EST parameter to dlacn2 is `EST[0]` in a Float64Array,
  not a scalar. Since FERR may have non-unit stride, a temporary Float64Array(1)
  must be used for EST and the result copied back to FERR after the loop.
- Workspace WORK is partitioned into three segments of N elements each
  (bounds, residual/vector, dlacn2 V workspace). The Fortran uses 1-based
  indexing into WORK (e.g., `WORK(N+1)`) which maps to offset `N*strideWORK`
  in 0-based JS.
- The KASE and ISAVE state arrays for dlacn2 must be re-initialized to 0
  at the start of each RHS column's condition estimation loop.

## Dependency interface surprises

- **dtrmv and dtrsv use long-form string parameters** (`'upper'`, `'lower'`,
  `'no-transpose'`, `'transpose'`, `'non-unit'`, `'unit'`), NOT the single-char
  Fortran convention (`'U'`, `'L'`, `'N'`, `'T'`). dtrrfs accepts single-char
  params per CLAUDE.md convention, so a mapping step is required. Lookup tables
  (UPLO_MAP, TRANS_MAP, DIAG_MAP) were added to convert.
- The `transt` variable (transpose of the solve direction for condition
  estimation) also needs the long-form mapping for dtrsv calls.
- dlacn2 uses single-char or no string params, so no mapping needed there.

## Automation opportunities

- The BLAS string convention mismatch (single-char vs long-form) is a pattern
  that will recur in every LAPACK routine calling BLAS. Consider adding a
  transform or utility module to handle the mapping automatically. This was
  a 2-occurrence pattern in this translation (dtrmv + dtrsv calls).

## Coverage gaps

- Lines 265-266, 278-279: the `safe2` fallback branches require WORK values
  near or below the safe minimum (underflow threshold). These are extremely
  hard to trigger with normal test matrices. Coverage: 98.80% line, 91.07%
  branch without them.
- All 8 parameter combinations (upper/lower x transpose/no-transpose x
  unit/non-unit) are tested, plus multi-RHS and quick-return edge cases.

## Complex number handling

- N/A: dtrrfs is a real (double precision) routine with no complex arithmetic.
