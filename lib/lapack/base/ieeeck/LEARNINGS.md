# ieeeck: Translation Learnings

## Translation pitfalls

- `ZERO` and `ONE` are `REAL`: every operation rounds to float32 (`float64ToFloat32`). It matters for inputs below the float32 range, e.g. `zero = 1e-50` is 0 in single precision.
- The reference returns 0 at the first failing test. Under IEEE 754 arithmetic the NEGINF test after `NEGINF = ONE / NEGZRO`, the two tests after the squaring, and the six NaN self-comparisons cannot fail once the tests before them have passed; they are written as combined conditions (same result, no side effects) so that the unreachable returns are two lines, not nine.

## Dependency interface surprises

- N/A (no dependencies).

## Missing automation

- `bin/gen-benchmark.mjs` calls `ieeeck( N, 1.0, 1.0 )`, which returns at the first test.

## Coverage gaps

- The two combined unreachable returns (see above). A 13-by-13 grid of `( zero, one )` (signed zeros, infinities, NaN) reaches every other exit.

## Complex number handling

- N/A.
