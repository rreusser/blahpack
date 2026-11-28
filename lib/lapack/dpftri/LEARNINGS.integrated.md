# dpftri: Translation Learnings

## Translation pitfalls

- The 8-case structure (odd/even x normal/transpose x lower/upper) matches dpftrf exactly, so following the dpftrf reference made translation straightforward.
- The `no-lonely-if` ESLint rule requires flattening nested `if/else { if }` into `else if` chains. For RFP routines with 8 code paths, a flat `if/else if` chain with compound conditions is cleaner than deeply nested blocks.
- The Fortran test must first call dpftrf before dpftri (the inverse operates on the Cholesky factor, not the original matrix). The fixture `input` field stores the original SPD matrix in RFP format.

## Dependency interface surprises

- `dtftri` takes a `diag` parameter (`'unit'`/`'non-unit'`) as its third argument, which dpftri always passes as `'non-unit'`.
- `dlauum` uses 2D stride convention `(strideA1, strideA2)` while `dtftri` uses 1D `(strideA, offsetA)`. This matches the pattern in dpftrf.
- `dsyrk` and `dtrmm` both use full 2D stride conventions for both matrix arguments.

## Automation opportunities

- N/A: The init_routine + gen_test pipeline worked well. The flat `else if` restructuring could potentially be automated for RFP routines.

## Coverage gaps

- 100% line and branch coverage achieved. All 8 code paths are tested with N=3 (odd) and N=4 (even). Additional coverage with N=5 (larger odd).

## Complex number handling

- N/A: dpftri is a real-valued routine.
