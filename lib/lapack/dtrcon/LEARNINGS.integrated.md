# dtrcon: Translation Learnings

## Translation pitfalls

- RCOND must be passed as a Float64Array of length 1 (output scalar pattern),
  not as a plain number. The Fortran signature has `RCOND` as a scalar output
  parameter; in JS we use `RCOND[0]`.
- The Fortran code uses `WORK(N+1)` and `WORK(2*N+1)` for sub-regions of the
  workspace. In 0-based JS with stride, these map to `offsetWORK + N*strideWORK`
  and `offsetWORK + 2*N*strideWORK`.
- IDAMAX returns a 0-based index in JS (vs 1-based in Fortran). In Fortran,
  `WORK(IX)` directly indexes; in JS, `WORK[offsetWORK + ix * strideWORK]`.
- The Fortran code has a backward GOTO (label 10) for the dlacn2 reverse
  communication loop. This maps cleanly to a `while (true)` loop with
  `break` when `KASE[0] === 0`.
- The forward GOTO (label 20) for the scale-overflow early exit maps to
  a simple `return 0` since RCOND is already initialized to 0.

## Dependency interface surprises

- dlacn2 uses reverse-communication: caller must allocate ISAVE (Int32Array
  of length 3), KASE (Int32Array of length 1), and EST (Float64Array of
  length 1) as state arrays. KASE[0] must be set to 0 before the first call.
- dlatrs uses long-form strings for uplo/trans/diag ('upper', 'no-transpose',
  'non-unit') but single-char for normin ('N'/'Y'). The scale output is
  passed as a Float64Array of length 1 (scale[0]).
- dlantr expects 'one-norm'/'inf-norm' for the norm parameter (not '1'/'I'
  as in Fortran). The uplo/diag params also use long-form strings.
- dlacn2 signature: the ISGN parameter maps to IWORK from the caller's
  perspective, reusing the integer workspace.

## Automation opportunities

- The deps file generator (init_routine.py) did not include `la_constants`
  and `la_xisnan` which are Fortran module dependencies of `dlassq.f90`.
  Had to add them manually. This could be improved by parsing `.f90` USE
  statements in the dependency analyzer.

## Coverage gaps

- Lines 149-155 (scale-overflow early exit: `scale < xnorm * smlnum || scale === 0`)
  are not covered. This path requires dlatrs to return a near-zero scale factor,
  which only happens with matrices near machine underflow threshold. The branch
  is a safety guard matching the Fortran reference.
- 95.93% line coverage, 92.86% branch coverage -- above targets.

## Complex number handling

- N/A: dtrcon is a real (double) routine, no complex arithmetic.
