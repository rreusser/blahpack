# zupmtr: Translation Learnings

## Translation pitfalls

- The 0-based to 1-based index translation for the packed-storage pointer `ii` follows the same pattern as dopmtr. The Fortran loop variable I is 1-based; our loop variable i is 0-based (Fortran I = i + 1). All the `ii` update formulas must account for this shift.
- The upper branch's AP offset for zlarf is `ii - i` (0-based), corresponding to Fortran `II - I + 1` (1-based).

## Dependency interface surprises

- zlarf takes `tau` as a Complex128Array + offsetTau (in complex elements), not as a scalar. Since zupmtr needs to optionally conjugate tau before passing it, a module-level scratch Complex128Array is used to hold the (possibly conjugated) tau value, similar to the pattern in zlarfg.

## Automation opportunities

- None identified; the translation was straightforward given dopmtr as a template.

## Coverage gaps

- All 8 combinations of (left/right) x (upper/lower) x (no-transpose/conjugate-transpose) are tested with C = I_4.
- Two rectangular tests (4x2 and 2x4) with non-identity C are included.
- Quick return paths (M=0, N=0) are tested.
- AP restoration is verified.

## Complex number handling

- The key complex-specific aspect is conjugating TAU for the `conjugate-transpose` case: `scratchTauView[1] = -tauv[oT + 1]`. This replaces Fortran's `DCONJG(TAU(I))`.
- AP(II) is set to (1.0, 0.0) -- complex ONE -- instead of just 1.0 as in the real dopmtr.
- All arrays use complex-element strides (multiplied by 2 for Float64 access via reinterpret).
