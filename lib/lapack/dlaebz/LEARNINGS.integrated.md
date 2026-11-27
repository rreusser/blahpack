# dlaebz: Translation Learnings

## Translation pitfalls

- MMAX was listed as "consumed" by the signature generator (it's the leading dimension of AB/NAB), but it's also needed as a logical limit for interval overflow checking. Had to re-add it as an explicit `mmax` parameter.
- The Fortran uses 1-based `KF..KL` for the active interval range. Translating to 0-based: `kf` and `kl` represent the same count semantics (kl = number of intervals), and `klnew` in the splitting logic uses `klnew-1` for 0-based array indexing.
- The parallel path (nbmin > 0) and serial path have subtly different overflow checks: parallel checks `KLNEW.LE.MMAX` AFTER increment, serial checks `KLNEW.LT.MMAX` BEFORE increment. Both allow the same max KLNEW=MMAX.
- PIVMIN condition: Fortran uses `IF(WORK(JI).LE.PIVMIN)` which treats PIVMIN as a positive threshold. The pivot is forced to be at most `-PIVMIN` (negative). This is critical for Sturm sequence stability.

## Dependency interface surprises

- N/A: dlaebz is a leaf routine with no external deps (just dlamch, which is used only in the test setup).

## Automation opportunities

- The 2D array stride pattern (AB, NAB with stride1/stride2/offset) is common in LAPACK routines with workspace arrays. A helper to create "views" of Float64Array/Int32Array with 2D strides could reduce error-prone offset arithmetic.

## Coverage gaps

- MMAX overflow path (info = mmax + 1) is hard to trigger without creating a scenario with more eigenvalues than available slots. Covered at 89.47% branch.
- The `nbmin > 0` path within the IJOB=2 overflow error (`info !== 0` early return) is hard to reach since MMAX is typically large enough.

## Complex number handling

- N/A: dlaebz is a real-valued routine.
