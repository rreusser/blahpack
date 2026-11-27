# dlatrs: Translation Learnings

## Translation pitfalls

- SCALE is an in/out parameter: must be passed as Float64Array, not a scalar.
  Callers access scale[0] for the result.
- The Fortran label 100 goto (skip diagonal division for unit diagonal) maps
  to a `continue` statement after doing the off-diagonal update. This was
  structurally tricky — the unit diagonal non-transpose path does the
  off-diagonal update inline then continues, while the non-unit path falls
  through to a shared off-diagonal update section.
- SMLNUM = DLAMCH('S') / DLAMCH('E'), not just DLAMCH('S'). This is the
  "safe minimum divided by machine precision" — different from the SMLNUM
  used in drscl.
- The Fortran code reuses `J` as both the loop variable and the idamax result.
  In JS, we use separate variables to avoid confusion.
- idamax returns 0-based in JS, so the loop bound checks use j !== jlast
  (not j >= jlast or j <= jlast) with the appropriate jinc.

## Dependency interface surprises

- dlange requires WORK array even for 'M' (max) norm, though it's not actually
  used. Must allocate a dummy Float64Array(1).
- dasum with N=0 returns 0 (for computing empty column norms).
- daxpy offset arguments: the second array's offset includes the j+1 shift for
  lower triangular updates.

## Automation opportunities

- The careful solve path (non-transpose and transpose) has highly parallel
  structure that could potentially be extracted into a helper function.

## Coverage gaps

- Lines 117-160 (CNORM overflow recomputation with dlange): requires column
  norms > DLAMCH('O'), which means matrix entries must overflow dasum. Very
  hard to trigger without Inf entries.
- Lines 282-284 (off-diagonal overflow scaling for unit diagonal): requires
  CNORM[j] > (BIGNUM - xmax) / xj with xj > 1, which needs specific
  magnitude relationships.
- Lines 346-348, 379-381, 398-408, 427-435, 445-456: various scaling edge
  cases in the careful solve that require very specific near-overflow
  conditions.
- Overall: 82% line / 91% branch coverage.

## Complex number handling

- N/A — real-only routine.
