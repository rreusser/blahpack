# dlangt: Translation Learnings

## Translation pitfalls

- Fortran uses LSAME for single-char comparison. JS uses long-form strings ('max-norm', 'one-norm', 'infinity-norm', 'frobenius-norm'). The Fortran also aliases '1' with 'O' and 'F' with 'E'; in JS we just use the canonical long-form string.
- NaN propagation: Fortran uses `DISNAN(ABS(X))` to check for NaN. JS uses `temp !== temp` (self-comparison NaN test). Must also propagate NaN via the `anorm < temp || temp !== temp` pattern.
- dlassq returns an object `{scl, sumsq}` rather than modifying in/out parameters. Chain calls by passing `res.scl` and `res.sumsq` to subsequent calls.

## Dependency interface surprises

- dlassq takes (N, x, stride, offset, scale, sumsq) and returns `{scl, sumsq}`. This differs from the Fortran in/out pattern. The initial call uses scale=0.0, sumsq=1.0.

## Automation opportunities

- N/A: straightforward translation.

## Coverage gaps

- The max-norm loop for N=1 case is covered by the condition `N <= 0` returning 0 and then the N=1 test. The 93% line coverage is because the loop body `for i < N-1` never executes when N=1 (loop count is 0).

## Complex number handling

- N/A: dlangt is a real-valued routine.
