# dlaqge: Translation Learnings

## Translation pitfalls

- EQUED is an output CHARACTER in Fortran. In JS, since we cannot pass strings by reference, dlaqge returns the equed string directly. Callers must capture the return value.
- The THRESH constant (0.1) and SMALL/LARGE thresholds are computed from dlamch at module scope to avoid per-call overhead.
- The condition `rowcnd >= THRESH && amax >= SMALL && amax <= LARGE` must be evaluated exactly as in Fortran -- the outer if/else-if/else structure determines which scaling is applied.

## Dependency interface surprises

- dlamch('S') returns safe minimum, dlamch('E') returns machine epsilon (half-precision). SMALL = S/E, LARGE = 1/SMALL -- matching the Fortran DLAMCH('Safe minimum') / DLAMCH('Precision').

## Automation opportunities

- The `print_char` subroutine was added to test_utils.f90 to support character output in JSONL fixtures. This is now available for future routines with character outputs.

## Coverage gaps

- 100% line and branch coverage achieved. All four equilibration modes (N, R, C, B) plus both quick-return paths are tested.

## Complex number handling

- N/A: dlaqge is a real-valued routine.
