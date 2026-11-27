# dpoequ: Translation Learnings

## Translation pitfalls

- dpoequ returns scalar outputs (scond, amax) that cannot be passed by reference in JS. Followed the dgeequ pattern: return an object `{ info, scond, amax }` instead of writing to parameter slots.
- The signature generator includes `scond` and `amax` as parameters, but they are output-only scalars. The actual base.js signature omits them and returns them in the result object.

## Dependency interface surprises

- N/A: dpoequ is a leaf routine with no LAPACK dependencies.

## Automation opportunities

- N/A: straightforward translation, no repeated patterns.

## Coverage gaps

- 100% line and branch coverage achieved.

## Complex number handling

- N/A: dpoequ is a real-valued routine.
