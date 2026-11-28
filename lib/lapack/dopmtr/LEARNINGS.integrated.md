# dopmtr: Translation Learnings

## Translation pitfalls

- The packed storage index tracking (variable `ii`) requires careful 0-based/1-based conversion. Fortran uses `II` to track position within the packed AP array, and the update formula `II = II + I + 2` (upper, forward) becomes `ii += i + 3` in 0-based JS because Fortran's `I` is 1-based while our `i` is 0-based.
- Unlike DORMTR which delegates to DORMQL/DORMQR, DOPMTR directly calls DLARF in a loop because packed storage does not have a 2D column structure. The reflector vector location is computed from the packed index `ii` rather than from column offsets.
- The upper and lower branches have different formulas for both the reflector start position and the `ii` update step. In the upper branch, the reflector for step `i` starts at `ii - i` (0-based), while in the lower branch it starts at `ii`.

## Dependency interface surprises

- DLARF takes a scalar `tau` value (not an array index), so we index TAU[offsetTAU + i*strideTAU] before passing it.
- DOPMTR temporarily modifies AP (sets elements to 1.0, then restores), matching the Fortran behavior. Tests verify AP is fully restored.

## Automation opportunities

- The upper and lower branches have parallel structure that could be unified with a few conditionals, but matching Fortran structure makes verification easier.

## Coverage gaps

- All 8 side/uplo/trans combinations tested with identity C (4x4).
- Rectangular cases tested: 4x2 (left, upper) and 2x4 (right, lower).
- Quick returns tested: M=0, N=0.
- AP restoration verified explicitly.

## Complex number handling

- N/A: dopmtr is a real-valued routine.
