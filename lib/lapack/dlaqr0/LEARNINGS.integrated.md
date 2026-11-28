# dlaqr0: Translation Learnings

## Translation pitfalls

- **dlaqr5 uses 0-based ktop/kbot/iloz/ihiz.** The dlaqr5 implementation
  converts from 0-based to 1-based internally (lines 185-188 of dlaqr5/base.js).
  All other routines (dlaqr3, dlahqr, dlaqr4) use 1-based indices matching Fortran.
  When calling dlaqr5, must pass `ktop-1`, `kbot-1`, `iloz-1`, `ihiz-1`. This
  caused a NaN-producing bug that was hard to trace (NaN propagated through
  subsequent AED calls without crashing).
- **dlaqr4 has the same dlaqr5 0-based bug.** The dlaqr4 implementation passes
  1-based ktop/kbot to dlaqr5 without subtracting 1. This bug is masked because
  dlaqr4's existing tests only exercise the dlahqr (small matrix) path; no test
  exercises the dlaqr5 code path.
- **dlaqr4 also has a V stride bug.** It passes `WORK, strideWORK, offsetWORK, 3`
  for V to dlaqr5, which maps to `V=WORK, strideV1=strideWORK(=1), strideV2=offsetWORK(=0), offsetV=3`.
  strideV2 should be 3 (LDV=3), not 0. Same masked-by-test-coverage issue.
- **ILAENV parameter values matter.** Hardcoding nmin=NTINY(15) instead of the
  reference LAPACK default nmin=75 changes convergence behavior for N=16..75.
  Implemented iparmqShifts() helper to match reference LAPACK iparmq defaults.
- **dlaqr0 is structurally identical to dlaqr4** except it calls dlaqr3 (recursive)
  instead of dlaqr2 (non-recursive). The implementation was closely modeled on
  the existing dlaqr4.

## Dependency interface surprises

- **dlaqr3 returns {ns, nd}** as a JavaScript object, not via output parameters.
  The ns/nd output parameters from the Fortran signature are consumed into the
  return value.
- **dlanv2 returns an object** with fields {a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn}.
  Must extract the eigenvalue results from the return value rather than reading
  from output arrays.
- **dlaqr5's 0-based convention** is documented but easy to miss. All other
  routines in the dlaqr family use 1-based. This should be documented in
  docs/dependency-conventions.md.
- **V parameter to dlaqr5** is a 2D matrix (WORK reshaped as V(LDV,*) with LDV=3).
  Must pass strideV1=1, strideV2=3, not the WORK array's own strides.

## Automation opportunities

- The iparmq parameter computation (shifts, deflation window, crossover point)
  is identical between dlaqr0 and dlaqr4. Could factor out an `iparmq()` module.
- dlaqr0 and dlaqr4 are nearly identical; they differ only in which AED routine
  they call (dlaqr3 vs dlaqr2). Could share implementation via a common template.

## Coverage gaps

- 81.6% line coverage, 61.8% branch coverage.
- The iparmqShifts function has many branches for NH>=30, 60, 150, 590, 3000, 6000
  that require increasingly large matrices to exercise. Not tested.
- The workspace query (lwork=-1) return path is not tested.
- The exceptional shift path (ndfl % KEXSH === 0) is not tested because the
  diagonally dominant test matrices converge quickly.
- The submatrix shift computation path (kbot-ks+1 <= ns/2 -> dlacpy + dlaqr4/dlahqr)
  is not tested because AED provides enough shifts.
- The bubble sort and conjugate pair shuffling paths are not tested.
- The "two real shifts, use only one" path is not tested.

## Complex number handling

- N/A: dlaqr0 is a real (double) routine with no complex arithmetic.
