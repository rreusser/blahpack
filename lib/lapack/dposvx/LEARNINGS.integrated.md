# dposvx: Translation Learnings

## Translation pitfalls

- String convention mismatch: dpoequ and dlaqsy use single-char uplo ('U'/'L'), but dpotrf/dpotrs/dpocon/dporfs/dlacpy/dlansy all use long-form strings ('upper'/'lower', 'full', 'one-norm'). The driver must convert `upc = (uplo === 'upper') ? 'U' : 'L'` when calling dpoequ/dlaqsy.
- dpoequ returns an object `{ info, scond, amax }` rather than writing to parameter slots. The driver reads `eq.info`, `eq.scond`, `eq.amax`.
- dlaqsy returns the equed string directly (not via parameter).
- dpocon writes rcond to `rcond[0]` (Float64Array), not as a return value. Must allocate `RCOND = new Float64Array(1)` and read `RCOND[0]`.
- The Fortran deps file needed `la_constants` and `la_xisnan` added manually because `dlassq.f90` uses Fortran modules.

## Dependency interface surprises

- dpocon uses long-form uplo ('upper'/'lower'), confirmed by checking `uplo === 'upper'` in its source.
- dporfs does not return info -- it always returns 0 and just writes to FERR/BERR arrays.
- dlaqsy does NOT accept the `equed` parameter -- it determines and returns it. This differs from the signature generator output which shows `equed` as a parameter.

## Automation opportunities

- The Fortran deps file generator should auto-detect when `.f90` sources use modules like `la_xisnan` and `la_constants` and include them.

## Coverage gaps

- 98.26% line, 92.59% branch. Uncovered: the `scond = 1.0` branch when FACT='F', equed='Y', N=0 (contrived edge case). Also the quick return for nrhs=0.

## Complex number handling

- N/A: dposvx is a real-valued routine.
