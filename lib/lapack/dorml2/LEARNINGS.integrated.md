# dorml2: Translation Learnings

## Translation pitfalls

- Straightforward translation from Fortran. The real-valued version is much simpler
  than the complex zunml2 since there is no conjugation (zlacgv) or tau conjugation needed.
- The reflector vector is stored rowwise in A (row i, columns i:nq-1), so the stride
  passed to dlarf is strideA2 (column stride), not strideA1 (row stride).
- The save/restore of A(i,i) = 1.0 pattern is the standard reflector application idiom.

## Dependency interface surprises

- dlarf takes tau as a plain scalar (not array+offset) for the real version, unlike
  zlarf which takes TAU array + offset for the complex version. This means we pass
  `TAU[ offsetTAU + i * strideTAU ]` directly, not the array and offset separately.

## Automation opportunities

- N/A. The translation was clean and mechanical. The existing zunml2 served as a
  reliable template; the simplification was just removing all complex-specific logic
  (reinterpret, zlacgv, tau conjugation, Float64 stride doubling).

## Coverage gaps

- 100% line and branch coverage achieved with 9 tests covering all 4 SIDE/TRANS
  combinations plus 3 quick-return paths and 2 rectangular matrix cases.

## Complex number handling

- N/A. This is a real-valued routine (d-prefix). No complex arithmetic involved.
