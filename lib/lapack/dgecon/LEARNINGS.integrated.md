# dgecon: Translation Learnings

## Translation pitfalls

- RCOND is an output parameter: must be passed as Float64Array[1], not scalar.
- The Fortran code uses WORK(N+1) for the V array in dlacn2. In JS with
  stride-based indexing, this becomes offsetWORK + N * strideWORK.
- WORK is partitioned into 4 segments of N: [x, v, cnorm_lower, cnorm_upper].
  The dlatrs calls use different CNORM offsets for lower vs upper triangular.
- The norm parameter uses long-form strings: 'one-norm' and 'inf-norm'.
  The Fortran uses '1'/'O' for 1-norm and 'I' for infinity-norm via LSAME.
- DISNAN check: Fortran calls DISNAN(ANORM); JS uses `anorm !== anorm`.
- The loop around dlacn2 uses a labeled goto in Fortran (GO TO 10/20); in JS
  this becomes a while(true) loop with break.
- **Critical: GO TO 20 (scale overflow bail-out) must skip the rcond
  computation.** The Fortran label 20 is past the ainvnm/rcond block.
  In JS, a simple `break` would fall through to rcond computation,
  producing wrong results for singular matrices. Fix: use a `bail` flag
  to track whether the overflow exit was taken, and skip rcond computation
  when bail is true.

## Dependency interface surprises

- dlacn2 takes EST and KASE as Int32Array/Float64Array (mutable containers),
  not scalars. This differs from the Fortran interface where they are plain
  scalar in/out parameters.
- dlatrs returns scale via Float64Array[1], and the caller must combine
  sl * su to get the total scale.
- dlatrs string parameters use long-form: 'lower'/'upper',
  'no-transpose'/'transpose', 'unit'/'non-unit'. The normin parameter
  uses short-form 'N'/'Y'.
- The normin='Y' flag is set after the first dlacn2 iteration to skip
  recomputing column norms.

## Automation opportunities

- The dgecon/dpocon routines share nearly identical structure (reverse
  communication loop with dlatrs calls). Could be templated.

## Coverage gaps

- Lines 176-177 (bail flag / scale overflow bail-out): requires dlatrs to
  return scale=0 or very tiny scale. Triggered by singular matrices where
  the LU factor has a zero diagonal, but covered indirectly since the
  singular test exercises this path.
- Lines 186-187 (ainvnm === 0 / info=1): defensive path for when the
  norm estimate is exactly zero without triggering scale overflow.
- Lines 191-192 (rcond NaN/overflow check): defensive path.
- Overall: 97.01% line / 85.19% branch.

## Complex number handling

- N/A -- real-only routine.
