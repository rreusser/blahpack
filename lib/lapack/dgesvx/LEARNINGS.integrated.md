# dgesvx: Translation Learnings

## Translation pitfalls

- EQUED is both input (FACT='F') and output (FACT='N'/'E') in Fortran. In JS, it's passed as a string parameter and returned in the result object. The caller must read `result.equed` after the call.
- RCOND is an output scalar in Fortran but dgecon expects it as a Float64Array (writes to `rcond[0]`). In dgesvx, we allocate a temporary `new Float64Array(1)` for dgecon, then extract the value.
- String convention mismatch: dgesvx uses single-char strings for FACT/TRANS/EQUED at its API boundary, but dependencies (dgetrs, dgerfs) expect long-form strings ('no-transpose', 'transpose'). The conversion is done internally via a `transLong` variable.
- WORK and IWORK parameters were removed from the signature since all callees (dgerfs, dgecon) allocate their own workspace internally. The driver allocates workspace for dlange/dlantr as needed.
- The Fortran drops input validation (XERBLA) for negative INFO -- base.js skips all parameter validation per stdlib convention (ndarray.js handles that).
- The singular matrix early return (info > 0 from dgetrf) returns immediately with rcond=0 and the partial rpvgrw computation. The info=N+1 case (near-singular) only triggers after the full solve completes.

## Dependency interface surprises

- dgecon takes `rcond` as a Float64Array, not a scalar -- writes output to `rcond[0]`. This is because Fortran RCOND is an output scalar that dgecon modifies.
- dgeequ returns `{ info, rowcnd, colcnd, amax }` object (not just info). Must destructure to get the equilibration metrics.
- dlaqge returns an equed string (not void). The Fortran EQUED parameter is output-only.
- dlange and dlantr use long-form norm strings: 'max' (not 'M'), 'one-norm' (not '1'), 'inf-norm' (not 'I').
- dlantr uses long-form uplo/diag: 'upper' (not 'U'), 'non-unit' (not 'N').
- dlacpy uses 'full' (not 'F'/'A') for copying the entire matrix.

## Automation opportunities

- The FACT='N'/'E'/'F' to long-form TRANS conversion is a repeating pattern for expert drivers. Could be standardized.

## Coverage gaps

- 98.58% line, 92.31% branch on base.js. Uncovered paths:
  - `rpvgrw === 0.0` branches (lines 197, 218): would need a matrix where dlantr returns zero for the max element of U, which is extremely rare.
  - `info = N + 1` (lines 272-273): would need a matrix where rcond < machine epsilon but dgetrf still succeeds. This is hard to construct reliably for a 3x3 matrix.

## Complex number handling

- N/A: dgesvx is a real-valued routine.
